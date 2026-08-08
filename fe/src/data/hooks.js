/* Headless hooks: all page behaviour, zero markup.

   Design variants import these and render whatever they like. Adding a third
   look means writing JSX only — no fetching, no state machines, no drift
   between designs when an endpoint changes. */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  fetchEvent, fetchOrg, fetchUser, fetchOrgs, fetchTags,
  fetchOrgEvents, fetchUserEvents, fetchOrgName,
  searchEvents, geocode,
} from './api';

/* ── Toast ───────────────────────────────────────────────────────── */
export function useToast(duration = 2400) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);

  const show = useCallback((msg) => {
    setMessage(msg);
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), duration);
  }, [duration]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { message, visible, show };
}

/* ── Click-outside ───────────────────────────────────────────────── */
export function useClickOutside(onOutside) {
  const ref = useRef(null);
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onOutside]);
  return ref;
}

/* ── Tags ────────────────────────────────────────────────────────── */
export function useTags() {
  const [tags,    setTags]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    let alive = true;
    fetchTags()
      .then(t => { if (alive) { setTags(t); setLoading(false); } })
      .catch(() => { if (alive) { setError(true); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const nameOf = useCallback(
    slug => tags.find(t => t.slug === slug)?.name ?? slug,
    [tags]
  );

  return { tags, loading, error, nameOf };
}

/* ── Address autocomplete ────────────────────────────────────────── */
export function useAddressSuggestions(delay = 400) {
  const [suggestions, setSuggestions] = useState([]);
  const [open,        setOpen]        = useState(false);
  const timer = useRef(null);

  const query = useCallback((q) => {
    clearTimeout(timer.current);
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      const results = await geocode(q);
      setSuggestions(results);
      setOpen(results.length > 0);
    }, delay);
  }, [delay]);

  const dismiss = useCallback(() => setOpen(false), []);
  const reopen  = useCallback(() => setOpen(suggestions.length > 0), [suggestions]);
  const clear   = useCallback(() => { setSuggestions([]); setOpen(false); }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { suggestions, open, query, dismiss, reopen, clear };
}

/* ── Org names, cached across renders and pages ──────────────────── */
const orgNameCache = {};

function useOrgNames(events) {
  const [names, setNames] = useState(orgNameCache);

  useEffect(() => {
    if (events.length === 0) return;
    const needed = [...new Set(events.map(e => e.organizationId))]
      .filter(id => id != null && !(id in orgNameCache));
    if (needed.length === 0) return;

    let alive = true;
    Promise.all(needed.map(id => fetchOrgName(id).then(name => [id, name])))
      .then(pairs => {
        Object.assign(orgNameCache, Object.fromEntries(pairs));
        if (alive) setNames({ ...orgNameCache });
      });
    return () => { alive = false; };
  }, [events]);

  return names;
}

/* ── Events search page ──────────────────────────────────────────── */

const BLANK_FILTERS = {
  keyword: '', limit: 8, selectedTags: [],
  dateFrom: '', dateTo: '', timeFrom: '', timeTo: '',
  locationLat: '', locationLng: '', radiusMi: 25,
  sort: 'date', order: 'asc',
};

export function useEventsSearch() {
  const [events,  setEvents]  = useState([]);
  const [total,   setTotal]   = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [page,    setPage]    = useState(0);

  /* Draft filter state — what the user is editing right now. */
  const [draft, setDraft] = useState(BLANK_FILTERS);
  /* Applied filter state — what the last search actually ran with. */
  const [applied, setApplied] = useState(BLANK_FILTERS);
  const [locationLabel, setLocationLabel] = useState('');
  const [validationError, setValidationError] = useState('');

  const setField = useCallback((key, value) => {
    setDraft(d => ({ ...d, [key]: value }));
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    searchEvents(applied, page)
      .then(({ rows, total: apiTotal }) => {
        if (!alive) return;
        setEvents(rows);
        setTotal(apiTotal);
        setHasMore(
          apiTotal !== null
            ? (page * applied.limit + rows.length) < apiTotal
            : rows.length === applied.limit
        );
        setLoading(false);
      })
      .catch(() => { if (alive) { setError(true); setLoading(false); } });
    return () => { alive = false; };
  }, [applied, page]);

  const orgNames = useOrgNames(events);

  const search = useCallback(() => {
    if (draft.dateFrom && draft.dateTo && draft.dateFrom > draft.dateTo) {
      setValidationError('The "from" date has to come before the "to" date.');
      return;
    }
    if (draft.timeFrom && draft.timeTo && draft.timeFrom > draft.timeTo) {
      setValidationError('The "from" time has to come before the "to" time.');
      return;
    }
    setValidationError('');
    setApplied(draft);
    setPage(0);
  }, [draft]);

  const reset = useCallback(() => {
    setDraft(BLANK_FILTERS);
    setApplied(BLANK_FILTERS);
    setLocationLabel('');
    setValidationError('');
    setPage(0);
  }, []);

  const setLocation = useCallback((label, lat, lng) => {
    setLocationLabel(label);
    setDraft(d => ({ ...d, locationLat: lat, locationLng: lng }));
  }, []);

  const clearLocation = useCallback(() => {
    setLocationLabel('');
    setDraft(d => ({ ...d, locationLat: '', locationLng: '' }));
  }, []);

  /* Page size changes feel broken behind a Search button, so apply at once. */
  const setLimit = useCallback((limit) => {
    setDraft(d => ({ ...d, limit }));
    setApplied(a => ({ ...a, limit }));
    setPage(0);
  }, []);

  const toggleTag = useCallback((slug) => {
    setDraft(d => ({
      ...d,
      selectedTags: d.selectedTags.includes(slug)
        ? d.selectedTags.filter(s => s !== slug)
        : [...d.selectedTags, slug],
    }));
  }, []);

  const hasFilters = useMemo(() => Boolean(
    draft.keyword || draft.selectedTags.length || draft.dateFrom || draft.dateTo ||
    draft.timeFrom || draft.timeTo || draft.locationLat
  ), [draft]);

  const limit      = applied.limit;
  const totalPages = total !== null ? Math.max(1, Math.ceil(total / limit)) : null;
  const rangeStart = page * limit + 1;
  const rangeEnd   = page * limit + events.length;

  return {
    events, total, hasMore, loading, error, orgNames,
    page, setPage, totalPages, rangeStart, rangeEnd, limit,
    draft, setField, setLimit, toggleTag,
    locationLabel, setLocationLabel, setLocation, clearLocation,
    search, reset, hasFilters, validationError,
  };
}

/* ── Editable record (event / org / user share this shape) ───────── */

function useEditableRecord(id, loader) {
  const [record,  setRecord]  = useState(null);
  const [draft,   setDraft]   = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    setEditing(false);
    loader(id)
      .then(data => {
        if (!alive) return;
        setRecord(data);
        setDraft(data);
        setLoading(false);
      })
      .catch(() => { if (alive) { setError(true); setLoading(false); } });
    return () => { alive = false; };
  }, [id, loader]);

  const setValue = useCallback((key, value) => setDraft(d => ({ ...d, [key]: value })), []);
  const patch    = useCallback(values => setDraft(d => ({ ...d, ...values })), []);

  const startEdit = () => { setDraft({ ...record }); setEditing(true); };
  const cancel    = () => { setDraft({ ...record }); setEditing(false); };
  const save      = () => {
    const saved = { ...draft, updatedAt: new Date().toISOString() };
    setRecord(saved);
    setDraft(saved);
    setEditing(false);
  };

  return { record, draft, editing, loading, error, setValue, patch, startEdit, cancel, save, setRecord };
}

/* ── Single event ────────────────────────────────────────────────── */
export function useEventDetail(id) {
  const base = useEditableRecord(id, fetchEvent);
  const [orgName, setOrgName] = useState(null);
  const [rsvped,  setRsvped]  = useState(false);
  const toast = useToast();

  const orgId = base.record?.organizationId;
  useEffect(() => {
    if (orgId == null) { setOrgName(null); return; }
    let alive = true;
    fetchOrgName(orgId).then(name => { if (alive) setOrgName(name); });
    return () => { alive = false; };
  }, [orgId]);

  useEffect(() => { setRsvped(false); }, [id]);

  const toggleRsvp = () => {
    toast.show(rsvped ? 'RSVP cancelled.' : "You're signed up. Details are in your profile.");
    setRsvped(r => !r);
  };

  const save = () => { base.save(); toast.show('Event saved.'); };

  return { ...base, save, orgName, rsvped, toggleRsvp, toast };
}

/* ── Single organization + its events ────────────────────────────── */
export function useOrgDetail(id) {
  const base  = useEditableRecord(id, fetchOrg);
  const toast = useToast();
  const [events,        setEvents]        = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setEventsLoading(true);
    fetchOrgEvents(id)
      .then(list => { if (alive) setEvents(list); })
      .catch(() => { if (alive) setEvents([]); })
      .finally(() => { if (alive) setEventsLoading(false); });
    return () => { alive = false; };
  }, [id]);

  const save = () => { base.save(); toast.show('Organization saved.'); };

  return { ...base, save, events, eventsLoading, toast };
}

/* ── Single volunteer + their events ─────────────────────────────── */
export function useUserDetail(id) {
  const base  = useEditableRecord(id, fetchUser);
  const toast = useToast();
  const [events,        setEvents]        = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setEventsLoading(true);
    fetchUserEvents(id)
      .then(list => { if (alive) setEvents(list); })
      .catch(() => { if (alive) setEvents([]); })
      .finally(() => { if (alive) setEventsLoading(false); });
    return () => { alive = false; };
  }, [id]);

  const save = () => { base.save(); toast.show('Profile saved.'); };

  return { ...base, save, events, eventsLoading, toast };
}

/* ── Organization directory ──────────────────────────────────────── */
export function useOrgList() {
  const [orgs,    setOrgs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [query,   setQuery]   = useState('');

  useEffect(() => {
    let alive = true;
    fetchOrgs()
      .then(list => { if (alive) { setOrgs(list); setLoading(false); } })
      .catch(() => { if (alive) { setError(true); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orgs;
    return orgs.filter(o =>
      (o.name ?? '').toLowerCase().includes(q) ||
      (o.description ?? '').toLowerCase().includes(q) ||
      (o.address ?? '').toLowerCase().includes(q)
    );
  }, [orgs, query]);

  return { orgs, filtered, loading, error, query, setQuery };
}
