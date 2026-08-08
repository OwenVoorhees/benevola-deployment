import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { IconX } from '../../Components/Icons';
import { useAddressSuggestions, useClickOutside } from '../../data/hooks';
import { reverseGeocode } from '../../data/api';
import { formatCoord } from '../../data/format';

/* ── Marks ──────────────────────────────────────────────────────────
   A survey mark instead of the old leaf: a circle of latitude crossed by
   a meridian, with a leaf silhouette inside. Same idea, new hand. */

export const SurveyMark = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M12 2.5V21.5" stroke="currentColor" strokeWidth="1" opacity="0.45" />
    <path d="M2.5 12H21.5" stroke="currentColor" strokeWidth="1" opacity="0.45" />
    <path
      d="M17 7C17 7 13.6 7.4 11.2 9.1C8.8 10.8 8 12.9 8.4 14.6C8.8 16.3 10.6 17.2 12.4 16.5C14.6 15.7 16.4 12.9 16.9 10.3C17.2 8.6 17 7 17 7Z"
      fill="currentColor"
    />
  </svg>
);

export const Arrow = ({ size = 13 }) => (
  <svg className="mrd-arrow" width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2 7H12M12 7L8.4 3.4M12 7L8.4 10.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Caret = ({ open }) => (
  <svg className={'mrd-caret' + (open ? ' is-open' : '')} viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M2 3.6L5 6.6L8 3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Legend symbols — the four keys on the landing page map key. */
export const GlyphRing = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

export const GlyphSquare = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3.5 20.5L20.5 3.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export const GlyphCross = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2.5V21.5M2.5 12H21.5" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const GlyphTriangle = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3L21 20H3L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <circle cx="12" cy="15" r="2" fill="currentColor" />
  </svg>
);

/* ── Text primitives ────────────────────────────────────────────────── */

export const Mono = ({ children, tone, plain, as: Tag = 'span', className = '', ...rest }) => (
  <Tag
    className={[
      'mrd-mono',
      tone === 'signal' ? 'mrd-mono--signal' : '',
      tone === 'land'   ? 'mrd-mono--land'   : '',
      plain ? 'mrd-mono--plain' : '',
      className,
    ].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </Tag>
);

export const Label = ({ children }) => <span className="mrd-label">{children}</span>;

export const SectionIndex = ({ num, name }) => (
  <div className="mrd-index">
    <span className="mrd-index-num">§ {num}</span>
    <span className="mrd-index-name">{name}</span>
    <span className="mrd-index-rule" />
  </div>
);

export const Plate = ({ children, sunk, flat, pad, className = '', as: Tag = 'div', ...rest }) => (
  <Tag
    className={[
      'mrd-plate',
      sunk ? 'mrd-plate--sunk' : '',
      flat ? 'mrd-plate--flat' : '',
      pad  ? 'mrd-plate--pad'  : '',
      className,
    ].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </Tag>
);

/* ── Buttons ────────────────────────────────────────────────────────── */

function btnClass({ variant, sm, block, className }) {
  return [
    'mrd-btn',
    variant === 'ghost'  ? 'mrd-btn--ghost'  : '',
    variant === 'land'   ? 'mrd-btn--land'   : '',
    variant === 'danger' ? 'mrd-btn--danger' : '',
    sm    ? 'mrd-btn--sm'    : '',
    block ? 'mrd-btn--block' : '',
    className,
  ].filter(Boolean).join(' ');
}

export const Btn = ({ children, variant, sm, block, className = '', ...rest }) => (
  <button className={btnClass({ variant, sm, block, className })} {...rest}>{children}</button>
);

export const BtnLink = ({ children, to, variant, sm, block, className = '', ...rest }) => (
  <Link to={to} className={btnClass({ variant, sm, block, className })} {...rest}>{children}</Link>
);

export const Chip = ({ children, tone, solid, className = '', ...rest }) => (
  <span
    className={[
      'mrd-chip',
      tone === 'land'   ? 'mrd-chip--land'   : '',
      tone === 'signal' ? 'mrd-chip--signal' : '',
      solid ? 'mrd-chip--solid' : '',
      className,
    ].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </span>
);

/* ── Fields ─────────────────────────────────────────────────────────── */

export const Field = ({ label, error, hint, children }) => (
  <div className="mrd-form-row">
    {label && <Label>{label}</Label>}
    {children}
    {hint  && <Mono plain style={{ display: 'block', marginTop: 6 }}>{hint}</Mono>}
    {error && <span className="mrd-field-error">{error}</span>}
  </div>
);

export const TextInput = ({ error, large, className = '', ...rest }) => (
  <input
    className={['mrd-field', error ? 'mrd-field--err' : '', large ? 'mrd-field--lg' : '', className]
      .filter(Boolean).join(' ')}
    {...rest}
  />
);

export const NumberInput = ({ value, onChange, min = 0, suffix }) => (
  <div className="mrd-num-wrap">
    <input
      type="number"
      className="mrd-field"
      value={value ?? ''}
      min={min}
      onChange={e => onChange(Number(e.target.value))}
    />
    {suffix && <span className="mrd-num-suffix">{suffix}</span>}
  </div>
);

export const StateBlock = ({ children, note, error }) => (
  <div className={'mrd-state' + (error ? ' mrd-state--error' : '')}>
    {children}
    {note && <span className="mrd-state-note">{note}</span>}
  </div>
);

export const Toast = ({ toast }) => (
  <div className={'mrd-toast' + (toast.visible ? ' is-on' : '')} role="status" aria-live="polite">
    {toast.message}
  </div>
);

/* ── Address search ─────────────────────────────────────────────────── */

export function AddressField({ value, onTextChange, onPick, placeholder = 'City, address, or place' }) {
  const { suggestions, open, query, dismiss, reopen } = useAddressSuggestions();
  const wrapRef = useClickOutside(dismiss);

  return (
    <div className="mrd-suggest-wrap" ref={wrapRef}>
      <input
        className="mrd-field"
        value={value ?? ''}
        placeholder={placeholder}
        autoComplete="off"
        onChange={e => { onTextChange(e.target.value); query(e.target.value); }}
        onFocus={reopen}
      />
      {open && (
        <div className="mrd-suggest">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => { onPick(s.display_name, parseFloat(s.lat), parseFloat(s.lon)); dismiss(); }}
            >
              {s.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Maps ───────────────────────────────────────────────────────────── */

const pinSvg = (fill) => `
  <svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 33.5V16" stroke="${fill}" stroke-width="1.6"/>
    <circle cx="13" cy="10" r="8.2" fill="none" stroke="${fill}" stroke-width="2.2"/>
    <circle cx="13" cy="10" r="2.6" fill="${fill}"/>
  </svg>`;

export const PIN = L.divIcon({
  className: '',
  html: pinSvg('#c2410c'),
  iconSize: [26, 34],
  iconAnchor: [13, 34],
});

function MapMover({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function MapClicks({ editing, onPick }) {
  useMapEvents({
    click: async (e) => {
      if (!editing) return;
      const label = await reverseGeocode(e.latlng.lat, e.latlng.lng);
      onPick(label, e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const FALLBACK_CENTER = [39.5, -98.35];

/** Full map plate with a header, coordinate readout, and optional edit mode. */
export function MapPlate({ lat, lng, address, editing, onPick, tall }) {
  const has    = lat != null && lng != null;
  const center = has ? [lat, lng] : FALLBACK_CENTER;

  return (
    <Plate className="mrd-map">
      <div className="mrd-map-head">
        <Mono>Location</Mono>
        {address && <span className="mrd-map-addr">{address}</span>}
      </div>
      <div className={'mrd-map-canvas' + (tall ? ' mrd-map-canvas--tall' : '')}>
        <MapContainer
          center={center}
          zoom={has ? 14 : 4}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {has && <Marker position={[lat, lng]} icon={PIN} />}
          <MapClicks editing={editing} onPick={onPick} />
          <MapMover lat={lat} lng={lng} />
        </MapContainer>
      </div>
      {editing && <div className="mrd-map-hint">Click the map to drop a pin</div>}
      <div className="mrd-map-coords">
        <Mono>{formatCoord(lat, 'lat')}</Mono>
        <Mono>{formatCoord(lng, 'lng')}</Mono>
      </div>
    </Plate>
  );
}

/** Static locator thumbnail for list rows. */
export function MiniMap({ lat, lng }) {
  const has = lat != null && lng != null;
  return (
    <div className="mrd-minimap">
      <MapContainer
        center={has ? [lat, lng] : FALLBACK_CENTER}
        zoom={has ? 12 : 3}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        attributionControl={false}
        doubleClickZoom={false}
        keyboard={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {has && <Marker position={[lat, lng]} icon={PIN} />}
      </MapContainer>
    </div>
  );
}

/* ── Password field ─────────────────────────────────────────────────── */

export function PasswordInput({ value, onChange, placeholder, error, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="mrd-pw">
      <TextInput
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="mrd-pw-eye"
        onClick={() => setShow(s => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
          {show
            ? <>
                <path d="M1.5 12S5.5 4.8 12 4.8 22.5 12 22.5 12 18.5 19.2 12 19.2 1.5 12 1.5 12Z" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
              </>
            : <path d="M17.9 17.9A10 10 0 0 1 12 19.8C5.5 19.8 1.5 12 1.5 12a18.4 18.4 0 0 1 5.1-5.9M9.9 4.4A9.1 9.1 0 0 1 12 4.2c6.5 0 10.5 7.8 10.5 7.8a18.5 18.5 0 0 1-2.2 3.2m-6.7-1.1a3 3 0 1 1-4.2-4.2M1.5 1.5l21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
        </svg>
      </button>
    </div>
  );
}

/* ── Tag picker ─────────────────────────────────────────────────────── */

export function TagPicker({ tags, loading, selected, onToggle }) {
  const [query, setQuery] = useState('');

  const available = tags.filter(t =>
    !selected.includes(t.slug) && t.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {selected.length > 0 && (
        <div className="mrd-taglist">
          {selected.map(slug => {
            const name = tags.find(t => t.slug === slug)?.name ?? slug;
            return (
              <span key={slug} className="mrd-chip mrd-chip--signal">
                {name}
                <button className="mrd-chip-x" onClick={() => onToggle(slug)} aria-label={`Remove ${name}`}>
                  <IconX size={10} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <input
        className="mrd-field"
        placeholder="Filter tags"
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ marginBottom: 8 }}
      />

      <div className="mrd-tag-scroll">
        {loading ? (
          <span className="mrd-tag-empty">Loading tags</span>
        ) : available.length === 0 ? (
          <span className="mrd-tag-empty">{query ? 'No match' : 'All selected'}</span>
        ) : (
          available.map(tag => (
            <button
              key={tag.id}
              type="button"
              className="mrd-chip"
              onClick={() => { onToggle(tag.slug); setQuery(''); }}
            >
              {tag.name}
            </button>
          ))
        )}
      </div>
    </>
  );
}
