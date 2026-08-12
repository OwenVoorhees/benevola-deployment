/* Thin API layer. Every variant talks to the backend through here, so a
   change to an endpoint is a one-file change rather than a per-design one. */

export const API = process.env.REACT_APP_API_URL;

/* ── Request plumbing ────────────────────────────────────────────────
   The API authenticates with a session cookie, so every request to our own
   backend must send credentials — a plain fetch() drops the cookie on a
   cross-origin call and the server sees an anonymous request. Successful
   payloads come back wrapped as { message, data }. */

/** Non-2xx response from our API, carrying the status and parsed body. */
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || body?.error || `Request failed (${status})`);
    this.name   = 'ApiError';
    this.status = status;
    this.body   = body;
  }
}

async function request(url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    credentials: 'include',
    ...(body !== undefined
      ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : {}),
  });

  if (res.status === 204) return null;

  let payload = null;
  try { payload = await res.json(); } catch { /* empty or non-JSON body */ }

  if (!res.ok) throw new ApiError(res.status, payload);
  return payload;
}

/** Turn a failed request into something worth showing a person. */
export function describeApiError(err, fallback = 'Something went wrong. Please try again.') {
  if (!(err instanceof ApiError)) {
    return 'Could not reach the server. Check your connection.';
  }
  if (err.status === 401) return 'Your session has expired. Please log in again.';
  if (err.status === 403) return 'You do not have permission to do that.';
  if (err.status === 404) return 'That record could not be found.';
  if (err.status === 409) return err.body?.message || 'That conflicts with something that already exists.';

  // Zod failures come back as { bodyValidationError: [ { path, message } ] }
  const issue = err.body?.bodyValidationError?.[0] ?? err.body?.details?.[0];
  if (issue?.message) {
    const field = Array.isArray(issue.path) ? issue.path.join('.') : issue.path;
    return field ? `${field}: ${issue.message}` : issue.message;
  }
  return err.message || fallback;
}

/** Peel the { message, data } envelope the API wraps successful payloads in. */
function unwrap(payload) {
  return payload && typeof payload === 'object' && 'data' in payload
    ? payload.data
    : payload;
}

async function getJson(url) {
  return request(url);
}

/* ── Mappers ─────────────────────────────────────────────────────── */

export function mapEvent(d) {
  return {
    id:             d.id,
    organizationId: d.organizationId,
    title:          d.title,
    description:    d.description ?? '',
    capacity:       d.capacity,
    spotsLeft:      d.capacity,
    duration:       (d.duration ?? 0) / 60,
    date:           d.date,
    address:        d.address,
    lat:            d.latitude,
    lng:            d.longitude,
    heroImage:      d.image ?? null,
    tags:           (d.Tags ?? []).map(t => t.slug),
    tagObjects:     d.Tags ?? [],
    createdAt:      d.createdAt,
    updatedAt:      d.updatedAt,
  };
}

export function mapOrg(d) {
  return {
    id:          d.id,
    name:        d.name,
    description: d.description,
    email:       d.email,
    phone:       d.phone,
    address:     d.address,
    bannerImg:   d.bannerImg,
    iconImg:     d.iconImg,
    createdAt:   d.createdAt,
    updatedAt:   d.updatedAt,
  };
}

export function mapUser(d) {
  return {
    id:          d.id,
    username:    d.username,
    email:       d.email,
    displayName: d.displayName,
    profilePic:  d.profilePic,
    role:        d.role,
    createdAt:   d.createdAt,
    updatedAt:   d.updatedAt,
  };
}

/* ── Reads ───────────────────────────────────────────────────────── */

export async function fetchEvent(id) {
  const { data } = await getJson(`${API}/api/events/${id}`);
  return mapEvent(data);
}

export async function fetchOrg(id) {
  const { data } = await getJson(`${API}/api/orgs/${id}`);
  return mapOrg(data);
}

export async function fetchUser(id) {
  const { data } = await getJson(`${API}/api/users/${id}`);
  return mapUser(data);
}

export async function fetchOrgs() {
  const data = await getJson(`${API}/api/orgs/`);
  return (data.data ?? []).map(mapOrg);
}

export async function fetchTags() {
  const data = await getJson(`${API}/api/events/tags`);
  return data.tags ?? [];
}

function listOf(res) {
  if (Array.isArray(res.data))   return res.data;
  if (Array.isArray(res.events)) return res.events;
  return [];
}

export async function fetchOrgEvents(id) {
  return listOf(await getJson(`${API}/api/orgs/${id}/events`)).map(mapEvent);
}

export async function fetchUserEvents(id) {
  return listOf(await getJson(`${API}/api/users/${id}/events`)).map(mapEvent);
}

/** Org name only, tolerant of both response shapes. Never throws. */
export async function fetchOrgName(id) {
  try {
    const res = await getJson(`${API}/api/orgs/${id}`);
    return res.data?.name ?? res.name ?? null;
  } catch {
    return null;
  }
}

/* ── Event search ────────────────────────────────────────────────── */

export function buildSearchUrl(filters, page) {
  const params = new URLSearchParams();

  if (filters.keyword) params.set('q', filters.keyword);
  filters.selectedTags.forEach(slug => params.append('tags', slug));

  if (filters.dateFrom) params.set('afterDate',  filters.dateFrom);
  if (filters.dateTo)   params.set('beforeDate', filters.dateTo);
  if (filters.timeFrom) params.set('afterTime',  filters.timeFrom);
  if (filters.timeTo)   params.set('beforeTime', filters.timeTo);

  if (filters.locationLat && filters.locationLng) {
    params.set('nearLat', filters.locationLat);
    params.set('nearLng', filters.locationLng);
    params.set('radiusM', Math.round(filters.radiusMi * 1609.344));
  }

  params.set('sort',   filters.sort);
  params.set('order',  filters.order);
  params.set('limit',  filters.limit);
  params.set('offset', page * filters.limit);

  const base = filters.keyword ? `${API}/api/events/search` : `${API}/api/events/`;
  return `${base}?${params.toString()}`;
}

export async function searchEvents(filters, page) {
  const data  = await getJson(buildSearchUrl(filters, page));
  const rows  = (data.data ?? []).map(mapEvent);
  const total = data.total ?? data.count ?? null;
  return { rows, total };
}

/* ── Session ─────────────────────────────────────────────────────── */

/** The logged-in principal, or null when the session is gone/expired.
    Returns { kind: 'user' | 'org', info: {...} }. */
export async function fetchMe() {
  try {
    return unwrap(await request(`${API}/api/auth/me`));
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

/* ── Writes ──────────────────────────────────────────────────────────
   The event endpoints validate with a .strict() schema, so the payload has
   to use the API's field names exactly — our UI shape (lat/lng/heroImage,
   duration in hours) has to be translated back on the way out. */

/** UI draft -> event API payload. Only includes keys the draft actually has. */
export function toEventPayload(draft) {
  const out = {};
  const has = k => Object.prototype.hasOwnProperty.call(draft, k);

  if (has('title'))       out.title       = draft.title;
  if (has('description')) out.description = draft.description || null;
  if (has('address'))     out.address     = draft.address || null;
  if (has('tags'))        out.tags        = draft.tags ?? [];
  // capacity/duration are .positive() server-side, so 0 and '' must go as null
  if (has('capacity'))    out.capacity    = Number(draft.capacity) > 0 ? Number(draft.capacity) : null;
  if (has('duration'))    out.duration    = Number(draft.duration) > 0 ? Math.round(Number(draft.duration) * 60) : null;
  if (has('date'))        out.date        = draft.date ? new Date(draft.date).toISOString() : null;
  if (has('lat'))         out.latitude    = Number(draft.lat);
  if (has('lng'))         out.longitude   = Number(draft.lng);
  // image must be a valid URL or null — an empty string fails validation
  if (has('heroImage'))   out.image       = draft.heroImage || null;

  return out;
}

/** The event write endpoints answer with { event, tags } rather than a row. */
function mapWrittenEvent(payload) {
  const { event, tags } = unwrap(payload) ?? {};
  return mapEvent({ ...event, Tags: tags ?? [] });
}

export async function createEvent(orgId, draft) {
  return mapWrittenEvent(
    await request(`${API}/api/orgs/${orgId}/events`, { method: 'POST', body: toEventPayload(draft) })
  );
}

export async function updateEvent(id, draft) {
  return mapWrittenEvent(
    await request(`${API}/api/events/${id}`, { method: 'PATCH', body: toEventPayload(draft) })
  );
}

export async function deleteEvent(id) {
  await request(`${API}/api/events/${id}`, { method: 'DELETE' });
}

export async function updateOrg(id, draft) {
  const body = {
    name:        draft.name,
    description: draft.description || null,
    phone:       draft.phone || null,
    address:     draft.address || null,
  };
  return mapOrg(unwrap(await request(`${API}/api/orgs/${id}`, { method: 'PATCH', body })));
}

export async function updateUser(id, draft) {
  const body = {
    displayName: draft.displayName || null,
    profilePic:  draft.profilePic || null,
  };
  if (draft.username) body.username = draft.username;
  return mapUser(unwrap(await request(`${API}/api/users/${id}`, { method: 'PATCH', body })));
}

/* ── Attendance ──────────────────────────────────────────────────── */

export async function fetchEventAttendees(id) {
  return unwrap(await getJson(`${API}/api/events/${id}/attendees`)) ?? [];
}

export async function joinEvent(id) {
  await request(`${API}/api/events/${id}/attendees`, { method: 'POST' });
}

export async function leaveEvent(id) {
  await request(`${API}/api/events/${id}/attendees/me`, { method: 'DELETE' });
}

/* ── Geocoding (OpenStreetMap Nominatim) ─────────────────────────── */

export async function geocode(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
    { headers: { 'Accept-Language': 'en' } }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function reverseGeocode(lat, lng) {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    return data.display_name ?? '';
  } catch {
    return '';
  }
}
