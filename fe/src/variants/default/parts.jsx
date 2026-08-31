import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_MODE, isSample } from '../../config';

/* Default primitives.

   Every colour here resolves back to --brand-primary / --brand-secondary,
   which the switcher writes onto :root. Nothing hardcodes a hue, so the whole
   theme re-skins the moment someone drags the picker. */

/* `fill` is a parameter because the mark appears two ways round: brand green on
   the page, and white on a brand ground wherever it stands in for a picture an
   organization has not uploaded. */
export const Mark = ({ size = 20, fill = 'var(--def-pri)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20 4C10 4 4 9 4 16c0 1.6.4 3 1.1 4.2C8 14 13 11 18 10c-4 2.4-7.5 6-9.7 10.8 1 .3 2 .5 3.2.5 6.5 0 9.5-6 8.5-17.3Z"
      fill={fill}
    />
  </svg>
);

export const Btn = ({ children, variant, sm, block, as: Tag = 'button', className = '', ...rest }) => (
  <Tag
    className={[
      'def-btn',
      variant === 'ghost' ? 'def-btn--ghost' : '',
      variant === 'quiet' ? 'def-btn--quiet' : '',
      sm ? 'def-btn--sm' : '',
      block ? 'def-btn--block' : '',
      className,
    ].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </Tag>
);

/** Text link with a nudging arrow. Stands in for a second button. */
export const ArrowLink = ({ to, children }) => (
  <Link className="def-arrow" to={to}>
    {children}
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </Link>
);

export const Eyebrow = ({ children }) => <span className="def-eyebrow">{children}</span>;

/* A lead-in that talks to the reader rather than labelling the section. Set in
   the display serif — see .def-kicker — so it carries on its own without the
   tracked-out capitals an eyebrow used to lean on. */
export const Kicker = ({ children }) => <span className="def-kicker">{children}</span>;

export const Panel = ({ children, pad, float, className = '', ...rest }) => (
  <div
    className={['def-panel', pad ? 'def-panel--pad' : '', float ? 'def-panel--float' : '', className]
      .filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </div>
);

export const Chip = ({ children, tone }) => (
  <span className={'def-chip' + (tone ? ` def-chip--${tone}` : '')}>{children}</span>
);

/* A tick that draws itself. Used wherever something the visitor did has just
   succeeded — the RSVP confirmation, the post-login welcome. */
export const Check = ({ size = 18 }) => (
  <svg
    className="def-check"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.13" />
    <path
      d="M7.5 12.4l3.1 3.1 6-6.4"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* True for a beat after data first arrives, false forever after.

   The stagger is worth having once, when a list appears out of nothing. Left
   on, it replays on every filter keystroke and the list strobes — so the class
   comes off as soon as the animation has had time to finish. */
export function useFirstReveal(ready) {
  const played = useRef(false);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    if (!ready || played.current) return undefined;
    played.current = true;
    setRevealing(true);
    const t = setTimeout(() => setRevealing(false), 900);
    return () => clearTimeout(t);
  }, [ready]);

  return revealing;
}

/* Marks one listing as seeded demo content. Renders nothing when the site is
   serving real data, so call sites do not need their own condition — and the
   day a real organization posts, only src/config.js changes. */
export const SampleTag = () => (
  isSample() ? <Chip tone="sample">Sample</Chip> : null
);

export const Field = ({ label, error, hint, children }) => (
  <div className="def-row">
    {label && <label className="def-label">{label}</label>}
    {children}
    {hint && !error && <span className="def-hint">{hint}</span>}
    {error && <span className="def-field-err">{error}</span>}
  </div>
);

export const Input = ({ error, className = '', ...rest }) => (
  <input className={['def-field', error ? 'def-field--err' : '', className].filter(Boolean).join(' ')} {...rest} />
);

export const Area = ({ error, ...rest }) => (
  <textarea className={'def-field' + (error ? ' def-field--err' : '')} {...rest} />
);

export const State = ({ title, error, children }) => (
  <div className={'def-state' + (error ? ' def-state--err' : '')}>
    {title && <strong>{title}</strong>}
    {children}
  </div>
);

/** The shape of the answer while it loads, rather than a spinner. */
export const Skeleton = ({ rows = 4 }) => (
  <div aria-busy="true" aria-live="polite">
    {Array.from({ length: rows }).map((_, i) => <div key={i} className="def-skel" />)}
  </div>
);

export const Toast = ({ toast }) => (
  <div className={'def-toast' + (toast.visible ? ' is-on' : '')} role="status" aria-live="polite">
    {toast.message}
  </div>
);

export const Crumbs = ({ items }) => (
  <nav className="def-crumbs" aria-label="Breadcrumb">
    {items.map((it, i) => (
      <span key={i}>
        {it.to ? <Link to={it.to}>{it.label}</Link> : <span>{it.label}</span>}
        {i < items.length - 1 && <span aria-hidden="true" className="def-crumb-sep">/</span>}
      </span>
    ))}
  </nav>
);

export const Meter = ({ value, max }) => {
  const known = value != null && max != null && max > 0;
  const pct = known ? Math.min(100, Math.round(((max - value) / max) * 100)) : 0;
  return (
    <div className="def-meter" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={'def-meter-fill' + (known && value === 0 ? ' is-full' : '')} style={{ width: `${pct}%` }} />
    </div>
  );
};

/* Loading an uploaded picture without leaving a hole in the page.

   Every slot below paints its own ground first — the mark on brand green for
   an organization, an initial for a person, the bands for a banner — and the
   uploaded file fades in on top once it has actually decoded. The point is
   that nothing is ever blank while a request is in flight: these files come
   straight from the bucket at whatever size they were uploaded, so on a slow
   connection that wait is real and used to be an empty box.

   `loaded` needs the ref as well as onLoad. A file already in the browser's
   cache can finish before React attaches the handler, and then onLoad never
   fires and the image stays at opacity 0 for good. The ref runs after the
   element exists, so it catches exactly that case. */
function useLoadedImage(src) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  /* Reset on src so a list that re-renders with different records does not
     inherit an earlier one's state. */
  useEffect(() => { setFailed(false); setLoaded(false); }, [src]);

  return {
    show: Boolean(src) && !failed,
    className: loaded ? ' is-on' : '',
    ref: (el) => { if (el?.complete && el.naturalWidth > 0) setLoaded(true); },
    onLoad: () => setLoaded(true),
    onError: () => setFailed(true),
  };
}

/* `org` switches the slot from a person's to an organization's: a rounded tile
   rather than a disc, because a logo cropped to a circle loses its corners,
   and the Benevola mark on brand green as the ground. A letter in a tinted
   circle reads as a missing file; the mark reads as a deliberate default, and
   because it is inline SVG it is there on the first frame whether or not a
   logo was ever uploaded. People keep the initial — theirs is a name, and a
   site logo standing in for a face would be worse. */
export const Avatar = ({ src, name, lg, org }) => {
  const img = useLoadedImage(src);

  return (
    <span
      className={[
        'def-avatar',
        lg ? 'def-avatar--lg' : '',
        org ? 'def-avatar--org' : '',
      ].filter(Boolean).join(' ')}
    >
      {org
        /* Sized by CSS, not by this number — see .def-avatar--org svg. */
        ? <Mark size={24} fill="var(--def-pri-ink)" />
        : <span className="def-avatar-ink">{(name || '?')[0].toUpperCase()}</span>}

      {img.show && (
        <img
          className={'def-avatar-img' + img.className}
          src={src}
          alt=""
          decoding="async"
          /* The big one is the page's identity and sits at the top; the small
             ones are list rows, most of which are below the fold and should
             not compete with what the visitor can already see. */
          loading={lg ? 'eager' : 'lazy'}
          fetchPriority={lg ? 'high' : 'auto'}
          ref={img.ref}
          onLoad={img.onLoad}
          onError={img.onError}
        />
      )}
    </span>
  );
};

/* An organization's banner, which every organization has whether or not one
   was uploaded.

   The default is drawn rather than fetched: flat bands of the brand green, in
   CSS, so it costs no request and is painted before anything has come back
   from the network. It is also what a blank field, a deleted object and a dead
   URL all land on, so the top of the page is never a gap or the browser's
   broken-image glyph. An uploaded picture fades in over it. */
export const Banner = ({ src, alt = '' }) => {
  const img = useLoadedImage(src);

  return (
    <div className="def-banner">
      <svg
        className="def-banner-bands"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {BANDS.map((d, i) => <path key={i} d={d} />)}
      </svg>

      {img.show && (
        <img
          className={'def-banner-img' + img.className}
          src={src}
          alt={alt}
          decoding="async"
          fetchPriority="high"
          ref={img.ref}
          onLoad={img.onLoad}
          onError={img.onError}
        />
      )}
    </div>
  );
};

/* The banner's bands.

   Each path is a wave plus everything under it, and they are painted in order,
   so every one covers the tail of the one before and what is left showing is a
   band. The first is the full rectangle — the ground the rest sit on.

   Only the shape is here; the shades are in CSS with the rest of the theme's
   colour. The viewBox is 200 tall to match the banner exactly, so with
   preserveAspectRatio="none" only the width ever stretches and the waves keep
   their height whatever the column does.

   The crests are set at different phases on purpose. Waves that peak in the
   same places read as one shape drawn six times; offset, they read as a
   landscape. */
const BANDS = [
  'M0,0 H1200 V200 H0 Z',
  'M0,30 C150,10 300,46 450,32 C620,16 760,52 900,38 C1010,27 1120,40 1200,34 V200 H0 Z',
  'M0,62 C140,44 280,80 420,66 C580,50 700,86 850,74 C980,64 1100,78 1200,70 V200 H0 Z',
  'M0,88 C120,108 260,74 400,90 C560,108 690,76 830,92 C960,107 1090,84 1200,96 V200 H0 Z',
  'M0,124 C160,104 300,140 450,126 C600,112 740,146 880,132 C1000,120 1110,134 1200,128 V200 H0 Z',
  'M0,150 C130,168 270,136 410,152 C570,170 700,138 840,154 C970,168 1090,146 1200,158 V200 H0 Z',
  'M0,178 C150,162 290,192 440,180 C600,167 730,194 870,184 C1000,175 1110,186 1200,180 V200 H0 Z',
];

/* A photograph that fails to a flat brand tile rather than to the browser's
   broken-image glyph.

   The pictures are listings' own cover photos, so the URL is whatever an
   organization saved: a host that has gone away, a file that was deleted, or
   nothing at all while the feed is still loading. Dropping the <img> leaves
   the wrapper's own tint showing, which reads as a deliberate block; the glyph
   reads as a bug. The tile keeps its size either way, so the picture arriving
   does not shift the page.

   `eager` is for anything above the fold: lazy-loading the hero shot only
   delays the first thing the visitor sees. */
export const Photo = ({ src, alt = '', eager, className = '' }) => {
  const [failed, setFailed] = useState(false);
  /* Reset on src so a band that re-renders with different pictures does not
     inherit an earlier tile's failure. */
  useEffect(() => setFailed(false), [src]);

  return (
    <span className={['def-photo', className].filter(Boolean).join(' ')}>
      {src && !failed && (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
};

/** Date block used down the left of every event row. */
export const DateBlock = ({ iso }) => {
  const d = iso ? new Date(iso) : null;
  return (
    <span className="def-date">
      <b>{d ? d.getDate() : '—'}</b>
      <span>{d ? d.toLocaleString('en', { month: 'short' }) : 'TBC'}</span>
    </span>
  );
};

/* ── Shell ──────────────────────────────────────────────────────────── */

/* No light/dark control in the header: the theme follows the operating system
   and updates live. See src/design/DesignContext.jsx. */

export default function Shell({ children }) {
  const { auth, isOrg, logout } = useAuth();
  const navigate = useNavigate();

  const accountId = auth?.user?.id;

  return (
    <div className="def-root">
      <header className="def-nav">
        <div className="def-nav-inner">
          <Link className="def-brand" to="/"><Mark /> Benevola</Link>

          <nav className="def-nav-links">
            <NavLink className={({ isActive }) => 'def-nav-link' + (isActive ? ' is-on' : '')} to="/events">
              Events
            </NavLink>
            <NavLink className={({ isActive }) => 'def-nav-link' + (isActive ? ' is-on' : '')} to="/organizations">
              Organizations
            </NavLink>
            <NavLink className={({ isActive }) => 'def-nav-link' + (isActive ? ' is-on' : '')} to="/about">
              About
            </NavLink>
          </nav>

          <div className="def-nav-right">
            {auth ? (
              <>
                {isOrg && (
                  <Btn as={Link} sm variant="quiet" to={`/organizations/${accountId}/events/new`}>
                    Post event
                  </Btn>
                )}
                <Btn
                  as={Link}
                  sm
                  variant="ghost"
                  to={isOrg ? `/organizations/${accountId}` : `/volunteer/${accountId}`}
                >
                  {isOrg ? 'Your organization' : 'Your profile'}
                </Btn>
                <Btn sm variant="quiet" onClick={async () => { await logout(); navigate('/'); }}>
                  Log out
                </Btn>
              </>
            ) : (
              <>
                <Btn as={Link} sm variant="quiet" to="/login">Log in</Btn>
                <Btn as={Link} sm to="/signup">Sign up</Btn>
              </>
            )}
          </div>
        </div>
      </header>

      {children}

      <footer className="def-foot">
        <div className="def-foot-inner">
          <div className="def-foot-brand">
            <Link className="def-brand" to="/"><Mark size={18} /> Benevola</Link>
            <p>Volunteer shifts from local organizations, with real dates and real capacity.</p>
          </div>
          <div className="def-foot-cols">
            <div>
              <h4>Volunteers</h4>
              <Link to="/events">Browse openings</Link>
              <Link to="/signup">Create an account</Link>
            </div>
            <div>
              <h4>Organizations</h4>
              <Link to="/organizations">Directory</Link>
              <Link to="/signup?role=organization">Post an event</Link>
            </div>
            <div>
              <h4>Benevola</h4>
              <Link to="/about">About</Link>
              <Link to="/login">Log in</Link>
            </div>
          </div>
        </div>
        <div className="def-foot-base">
          {DEMO_MODE && (
            /* Not dismissible on purpose: a banner people can close stops
               framing the site the moment they close it. */
            <p className="def-note def-foot-notice">
              <b>This is a student project, not a running service.</b> Benevola was
              built at NC State to learn on. Every organization and event listed here
              is sample data created by us — none of them are real, and nothing posted
              here is an event you can attend.
            </p>
          )}
          <span>Benevola · Built for good</span>
        </div>
      </footer>
    </div>
  );
}
