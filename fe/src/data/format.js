/* Shared formatting helpers — used by every design variant. */

export function formatDate(iso) {
  if (!iso) return 'TBD';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatFullDate(iso) {
  if (!iso) return 'Date TBD';
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });
}

export function formatDuration(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} ${h === 1 ? 'hr' : 'hrs'}`;
  return `${h} hr ${m} min`;
}

/** Day number + short month, for date blocks and calendar chips. */
export function splitDate(iso) {
  if (!iso) return { day: '—', month: 'TBD', weekday: '', year: '' };
  const d = new Date(iso);
  return {
    day:     d.toLocaleDateString('en-US', { day: 'numeric' }),
    month:   d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    year:    String(d.getFullYear()),
  };
}

/** "1234 Long Street, Springfield, IL, USA" -> "1234 Long Street, Springfield" */
export function shortAddress(address, parts = 2) {
  if (!address) return null;
  return address.split(',').slice(0, parts).join(',').trim();
}

/** Decimal degrees with a hemisphere letter, for map readouts. */
export function formatCoord(value, axis) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  const hemi = axis === 'lat' ? (n >= 0 ? 'N' : 'S') : (n >= 0 ? 'E' : 'W');
  return `${Math.abs(n).toFixed(4)}° ${hemi}`;
}

export function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}
