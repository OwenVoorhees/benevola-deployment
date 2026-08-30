import React from 'react';
import { Link } from 'react-router-dom';
import Shell, {
  ArrowLink, Btn, DateBlock, Kicker, Photo, State, Skeleton, useFirstReveal,
} from '../parts';
import { MapView } from '../../../shared/parts';
import { useEventsSearch } from '../../../data/hooks';
import { formatDate, formatDuration, shortAddress } from '../../../data/format';

/* The landing page answers one question: is there anything near me worth
   doing? The hero preview shows live openings rather than a stock mockup, so
   the proof and the product are the same object. */

/* The page's three editorial photographs. These are ours, in public/home/, not
   listings' cover photos: the hero and the two bands have to look the same on
   every visit and survive an empty database, which a picture borrowed from
   whatever happens to be posted this week cannot do. The openings rail still
   shows each listing's own photo, because there the picture IS the listing.

   All three are public domain — see public/home/README.md for the sources and
   why that matters. */
const SHOT = {
  hero:      '/home/hero.jpg',
  community: '/home/community.jpg',
  organize:  '/home/organize.jpg',
};

const Tick = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8.4l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* The tight row inside the hero's preview card — the only list shape left on
   this page, now that the openings below are cards. */
function Row({ event, orgName }) {
  return (
    <Link className="def-item" to={`/events/${event.id}`}>
      <span className="def-lead">
        <DateBlock iso={event.date} />
      </span>
      <span className="def-item-body">
        <span className="def-item-title">{event.title}</span>
        <span className="def-item-meta">
          {orgName && <span>{orgName}</span>}
          {event.address && <span>{shortAddress(event.address)}</span>}
          <span>{formatDuration(event.duration)}</span>
        </span>
      </span>
    </Link>
  );
}

/* One opening, as a picture. Everything the old row carried except the date and
   the title has come off: at this size the photograph is doing that work, and a
   card with six facts on it stops being something you scan. */
function Card({ event, index = 0 }) {
  return (
    /* --i drives the stagger delay on first reveal. See .def-stagger. */
    <Link className="def-card" to={`/events/${event.id}`} style={{ '--i': index }}>
      <Photo className="def-card-shot" src={event.heroImage} alt="" />
      <span className="def-card-date">{event.date ? formatDate(event.date) : 'Date to confirm'}</span>
      <span className="def-card-title">{event.title}</span>
    </Link>
  );
}

export default function Landing() {
  const s = useEventsSearch();
  /* Stagger the first list only — see useFirstReveal. */
  const revealing = useFirstReveal(!s.loading);
  const soon = s.events.slice(0, 6);

  /* May be null while the feed loads, or if nothing carries coordinates. The
     map is drawn either way — MapView falls back to Raleigh. */
  const pin = s.events.find(ev => ev.latitude != null && ev.longitude != null) ?? null;

  return (
    <Shell>
      <section className="def-hero">
        <div className="def-hero-inner">
          <div>
            <h1>Find work that fits the week you actually have.</h1>
            <p className="def-hero-lede">
              Real shifts from local organizations, with a date, a place and a
              capacity you can count on. Filter by cause, distance and the hours
              you can spare.
            </p>
            <div className="def-hero-actions">
              <Btn as={Link} to="/events">Browse openings</Btn>
              <ArrowLink to="/signup?role=organization">Post an event</ArrowLink>
            </div>
          </div>

          <div className="def-hero-media">
            {/* The photograph says what the week looks like; the card under it
                proves the openings are real. Both, in that order. */}
            <Photo
              className="def-hero-shot"
              src={SHOT.hero}
              alt="Two volunteers harvesting vegetables from a community garden"
              eager
            />

            <div className="def-preview" aria-hidden={s.loading ? 'true' : undefined}>
              <div className="def-preview-bar">
                <span className="def-preview-dot" />
                <span className="def-preview-dot" />
                <span className="def-preview-dot" />
                <span className="def-preview-title">Open near you</span>
              </div>
              <div className="def-preview-body">
                {s.loading ? (
                  <div style={{ padding: 16 }}><Skeleton rows={3} /></div>
                ) : soon.length === 0 ? (
                  <p className="def-muted" style={{ padding: '26px 18px', margin: 0 }}>
                    Nothing posted yet. New shifts land here first.
                  </p>
                ) : (
                  soon.slice(0, 3).map(ev => (
                    <Row key={ev.id} event={ev} orgName={s.orgNames[ev.organizationId]} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* What the site is: a tall photograph on the left, the pitch on the
          right. The picture is plain — nothing is set over it — so it is
          narrower than the page rather than full bleed. */}
      <section className="def-section">
        <div className="def-wrap">
          <div className="def-intro">
            <Photo
              className="def-intro-shot"
              src={SHOT.community}
              alt="A large group of volunteers gathered around the rubbish they collected at a park clean-up"
            />

            <div className="def-intro-copy">
              {/* Hard break: the two halves are a pair, and letting the column
                  width decide where they split reads as an accident. */}
              <h2 className="def-h2">Organizations post the work.<br />You pick the shift.</h2>
              <p className="def-sub">
                Local organizations post the shifts they need filled. You pick
                one that fits your week.
              </p>

              <div className="def-intro-steps">
                <div className="def-intro-step">
                  <h3>Find a shift</h3>
                  <p>By cause, date and radius.</p>
                </div>
                <div className="def-intro-step">
                  <h3>Sign on</h3>
                  <p>One click puts you on the roster.</p>
                </div>
                <div className="def-intro-step">
                  <h3>Turn up</h3>
                  <p>The details wait in your profile.</p>
                </div>
              </div>

              <div className="def-intro-actions">
                <Btn as={Link} to="/events">Browse openings</Btn>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local: plain ground, no photograph. Text left, the sample map right. */}
      <section className="def-section def-section--tint def-section--short">
        <div className="def-wrap">
          <div className="def-local">
            <div className="def-local-copy">
              <h2 className="def-h2">Close enough to actually get to.</h2>
              <p className="def-sub">
                Everything on Benevola is around Raleigh — near enough to reach
                after work or on a Saturday morning. Set how far you are willing
                to travel and the list comes back the right size.
              </p>
              <ArrowLink to="/events">See what is near you</ArrowLink>
            </div>

            {/* Not a link: Leaflet puts the OpenStreetMap attribution inside the
                canvas as an anchor, and anchors cannot nest. The title is the
                way through. */}
            <div className="def-local-map">
              <div className="def-local-map-head">
                {pin ? <Link to={`/events/${pin.id}`}>{pin.title}</Link> : <b>Around Raleigh</b>}
                <span>{pin?.address ? shortAddress(pin.address) : 'Raleigh, North Carolina'}</span>
              </div>
              <div className="def-local-map-canvas">
                <MapView lat={pin?.latitude} lng={pin?.longitude} zoom={12} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="def-section">
        <div className="def-wrap">
          <div className="def-section-head" style={{ marginBottom: 28 }}>
            <h2 className="def-h2">Happening soon</h2>
          </div>

          {s.loading ? (
            <Skeleton rows={4} />
          ) : s.error ? (
            <State error title="Could not load openings">
              The API is not answering. Try again in a moment.
            </State>
          ) : soon.length === 0 ? (
            <State title="Nothing posted yet">
              When organizations post shifts, they show up here first.
            </State>
          ) : (
            <>
              {/* Scrolls sideways rather than wrapping: the cards are wide
                  enough that a grid would put two on a row and bury the rest,
                  and a rail says "there are more" without a count. */}
              <div className={'def-rail def-fade-in' + (revealing ? ' def-stagger' : '')}>
                {soon.map((ev, i) => (
                  <Card key={ev.id} event={ev} index={i} />
                ))}
              </div>
              <div style={{ marginTop: 26 }}>
                <ArrowLink to="/events">See every opening</ArrowLink>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Photograph behind the whole band, under a flat brand scrim that the
          light ink is measured against — see .def-section--photo. */}
      <section
        className="def-section def-section--photo"
        style={{ backgroundImage: `url("${SHOT.organize}")` }}
      >
        <div className="def-wrap">
          <div className="def-split">
            <div>
              <Kicker>Are you an organization?</Kicker>
              <h2 className="def-h2">Post a shift in about three minutes.</h2>
              <p className="def-sub">
                Then watch the roster fill. Volunteers, hours and history stay in
                one place instead of a spreadsheet and four email threads.
              </p>
              <ul className="def-check">
                <li><Tick /> Set a capacity and stop overbooking</li>
                <li><Tick /> See exactly who signed on, and when</li>
                <li><Tick /> Edit a listing without taking it down</li>
              </ul>
              <div style={{ marginTop: 28 }}>
                <Btn as={Link} to="/signup?role=organization">Create an organization account</Btn>
              </div>
            </div>

            <div className="def-panel def-panel--float def-panel--pad">
              <h3 className="def-h3" style={{ marginBottom: 14 }}>Saturday, riverbank clean-up</h3>
              <dl style={{ margin: 0 }}>
                <div className="def-kv"><dt>Signed on</dt><dd>14 of 20</dd></div>
                <div className="def-kv"><dt>Hours logged</dt><dd>42 hrs</dd></div>
                <div className="def-kv"><dt>Posted</dt><dd>6 days ago</dd></div>
              </dl>
              <div className="def-meter" style={{ marginTop: 18 }}>
                <div className="def-meter-fill" style={{ width: '70%' }} />
              </div>
              <p className="def-muted" style={{ marginTop: 10 }}>
                A live roster, not a reply-all thread.
              </p>
            </div>
          </div>
        </div>
      </section>

    </Shell>
  );
}
