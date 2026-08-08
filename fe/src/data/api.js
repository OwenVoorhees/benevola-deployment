/* Thin API layer. Every variant talks to the backend through here, so a
   change to an endpoint is a one-file change rather than a per-design one. */

export const API = process.env.REACT_APP_API_URL;

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
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
