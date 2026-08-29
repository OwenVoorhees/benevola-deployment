import React from 'react';
import { Link } from 'react-router-dom';
import Shell, {
  ArrowLink, Btn, Chip, DateBlock, Eyebrow, Photo, State, Skeleton, useFirstReveal,
} from '../parts';
import { MapView } from '../../../shared/parts';
import { useEventsSearch } from '../../../data/hooks';
import { formatDuration, shortAddress } from '../../../data/format';

/* The landing page answers one question: is there anything near me worth
   doing? The hero preview shows live openings rather than a stock mockup, so
   the proof and the product are the same object. */

/* Every picture on this page is a real listing's cover photo, taken off the
   same feed that fills the openings list — nothing is a stock shot and nothing
   is a file we keep. So the page cannot show a photograph of work that is not
   actually posted, and it restyles itself the day the seed data changes.

   `nth` picks from the events that have a photo, so a listing posted without
   one leaves a gap in the list rather than a hole in the page. The order the
   API returns is by date and is stable, so the same slot keeps the same
   picture between renders. Returns null while the feed is still loading,
   which every caller below is written to handle. */
function photoAt(events, nth) {
  const withPhotos = events.filter(ev => ev.heroImage);
  return withPhotos[nth % (withPhotos.length || 1)] ?? null;
}

const Tick = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8.4l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Row({ event, orgName, compact, index = 0 }) {
  return (
    <Link className="def-item" to={`/events/${event.id}`} style={{ '--i': index }}>
      <span className="def-lead">
        <DateBlock iso={event.date} />
        {!compact && event.heroImage && (
          <img className="def-thumb" src={event.heroImage} alt="" loading="lazy" />
        )}
      </span>
      <span className="def-item-body">
        <span className="def-item-title">{event.title}</span>
        <span className="def-item-meta">
          {orgName && <span>{orgName}</span>}
          {event.address && <span>{shortAddress(event.address)}</span>}
          <span>{formatDuration(event.duration)}</span>
        </span>
      </span>
      {!compact && (
        <span className="def-chiprow">
          {event.tags.slice(0, 2).map(t => <Chip key={t}>{t.replace(/-/g, ' ')}</Chip>)}
        </span>
      )}
    </Link>
  );
}

export default function Landing() {
  const s = useEventsSearch();
  /* Stagger the first list only — see useFirstReveal. */
  const revealing = useFirstReveal(!s.loading);
  const soon = s.events.slice(0, 6);

  /* Three different listings, so the page does not show the same photograph
     three times, and the one whose pin the closing map drops. */
  const heroPick  = photoAt(s.events, 0);
  const orgPick   = photoAt(s.events, 1);
  const closePick = photoAt(s.events, 2);
  const pin = s.events.find(ev => ev.latitude != null && ev.longitude != null) ?? null;

  return (
    <Shell>
      <section className="def-hero">
        <div className="def-hero-inner">
          <div>
            <Eyebrow>Volunteering, locally</Eyebrow>
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
              src={heroPick?.heroImage}
              alt={heroPick ? `Volunteers at ${heroPick.title}` : ''}
              eager
            />

            <div className="def-preview" aria-hidden={s.loading ? 'true' : undefined}>
              <div className="def-preview-bar">
                <span className="def-preview-dot" />
                <span className="def-preview-dot" />
                <span className="def-preview-dot" />
                <span className="def-preview-title">OPEN NEAR YOU</span>
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
                    <Row key={ev.id} event={ev} orgName={s.orgNames[ev.organizationId]} compact />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </section>

      <section className="def-section def-section--tint">
        <div className="def-wrap">
          <div className="def-section-head">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="def-h2">Three steps, no phone tag.</h2>
          </div>

          <div className="def-rail">
            <div className="def-step">
              <h3>Find a shift</h3>
              <p>Search by cause, date and radius. Every listing carries a real date and a real address.</p>
            </div>
            <div className="def-step">
              <h3>Sign on</h3>
              <p>One click puts you on the roster. The organizer sees you immediately, and so do you.</p>
            </div>
            <div className="def-step">
              <h3>Turn up</h3>
              <p>Details stay in your profile. Change your mind and cancelling takes one click too.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="def-section">
        <div className="def-wrap">
          <div className="def-section-head" style={{ marginBottom: 28 }}>
            <Eyebrow>Open right now</Eyebrow>
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
              <div className={'def-list def-fade-in' + (revealing ? ' def-stagger' : '')}>
                {soon.map((ev, i) => (
                  <Row key={ev.id} event={ev} orgName={s.orgNames[ev.organizationId]} index={i} />
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
        className={'def-section' + (orgPick ? ' def-section--photo' : ' def-section--tint')}
        style={orgPick ? { backgroundImage: `url("${orgPick.heroImage}")` } : undefined}
      >
        <div className="def-wrap">
          <div className="def-split">
            <div>
              <Eyebrow>For organizations</Eyebrow>
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

      <section className="def-section">
        <div className="def-wrap">
          <div className="def-close">
            <div
              className={'def-cta' + (closePick ? ' has-photo' : '')}
              style={closePick ? { backgroundImage: `url("${closePick.heroImage}")` } : undefined}
            >
              <h2>Somebody nearby needs a hand this weekend.</h2>
              <p>Free for volunteers. Free for the organizations doing the work.</p>
              <Btn as={Link} to="/events">Find something to do</Btn>
            </div>

            {/* A real pin from a real listing, not a mock: the map is the same
                one the event page draws, so what it promises here is what the
                visitor gets when they click through. Hidden entirely until the
                feed has given us somewhere to point at, because an empty map
                of the mid-Atlantic sells nothing. */}
            {pin && (
              <div className="def-close-map">
                <div className="def-close-map-head">
                  <Link to={`/events/${pin.id}`}>{pin.title}</Link>
                  {pin.address && <span>{shortAddress(pin.address)}</span>}
                </div>
                {/* The card is not itself a link: Leaflet renders the OpenStreetMap
                    attribution as an anchor inside the canvas, and an anchor cannot
                    be nested in another one. The title above is the way through. */}
                <div className="def-close-map-canvas">
                  <MapView lat={pin.latitude} lng={pin.longitude} zoom={13} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </Shell>
  );
}
