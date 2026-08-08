import React from 'react';
import { Link } from 'react-router-dom';
import Shell from '../Shell';
import {
  Arrow, BtnLink, Mono, Plate, SectionIndex,
  GlyphRing, GlyphSquare, GlyphCross, GlyphTriangle,
} from '../parts';

const HERO_IMG = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1400&q=85&auto=format&fit=crop';
const WORK_IMG = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80&auto=format&fit=crop';

const LEGEND = [
  {
    glyph: <GlyphRing />,
    title: 'Search by ground, not by feed',
    body: 'Filter on distance, cause, skill, and the window you are actually free. Nothing infinite about it.',
  },
  {
    glyph: <GlyphSquare />,
    title: 'Every plot is surveyed',
    body: 'Organizations are checked before they can post, so a listing means a real shift with a real contact.',
  },
  {
    glyph: <GlyphCross />,
    title: 'One tap to commit',
    body: 'Sign on and you get directions, a contact, and what to bring. It lands in your calendar.',
  },
  {
    glyph: <GlyphTriangle />,
    title: 'Hours that count later',
    body: 'Logged time exports clean for schools, employers, and boards. Your record, not ours.',
  },
];

const ROUTE = [
  {
    num: '01',
    title: 'Take a bearing',
    body: 'Drop a pin on your neighbourhood, set a radius, and pick the causes you care about. The map narrows to what is reachable.',
  },
  {
    num: '02',
    title: 'Sign on',
    body: 'Read the brief, check the spots left, and RSVP. The organizer knows you are coming before you leave the house.',
  },
  {
    num: '03',
    title: 'Log the hours',
    body: 'Your profile keeps a running record of where you have been and what you did there, ready to hand over when it matters.',
  },
];

const FEATURES = [
  {
    num: '01',
    title: 'Matched on what you can offer',
    body: 'Skills, causes, and availability are all filters, not a black box. You can see exactly why something surfaced.',
  },
  {
    num: '02',
    title: 'No cold emails, no gatekeeping',
    body: 'Organizations post the shift, the address, and the contact. You do not have to introduce yourself to be useful.',
  },
  {
    num: '03',
    title: 'Local first, always',
    body: 'The default radius is twenty-five miles. Most of what you will find is closer than the supermarket.',
  },
];

const DESTINATIONS = [
  {
    num: '01',
    to: '/organizations',
    title: 'Browse organizations',
    body: 'Verified nonprofits and community groups, sorted by city and cause.',
  },
  {
    num: '02',
    to: '/events',
    title: 'Find events near you',
    body: 'One-off shifts and pop-up campaigns happening this week, sortable by distance, date, and hours.',
  },
  {
    num: '03',
    to: '/signup',
    title: 'Create a free profile',
    body: 'Save your skills and causes, log verified hours, and let the right opportunities come to you.',
  },
];

export default function Landing() {
  return (
    <Shell>
      {/* ── Hero ── */}
      <section className="mrd-hero mrd-topo">
        <div className="mrd-shell">
          <div className="mrd-hero-kicker">
            <Mono tone="signal">Benevola</Mono>
            <Mono>Volunteer survey · Edition 2026</Mono>
          </div>

          <div className="mrd-hero-grid">
            <div>
              <h1 className="mrd-display">
                Find the work<br />
                that is <span className="mrd-hero-em">ten minutes</span><br />
                from your door.
              </h1>
              <p className="mrd-lede" style={{ marginTop: 26 }}>
                Benevola plots verified volunteer shifts against where you actually are,
                what you are good at, and the hours you can genuinely give.
              </p>
              <div className="mrd-hero-actions">
                <BtnLink to="/events">Explore opportunities <Arrow /></BtnLink>
                <BtnLink to="/organizations" variant="ghost">Browse organizations</BtnLink>
              </div>
            </div>

            <Plate className="mrd-hero-plate">
              <img src={HERO_IMG} alt="Volunteers gathered outdoors at a community event" />
              <div className="mrd-hero-caption">
                <Mono>Plate 01 · Community clean-up</Mono>
                <Mono tone="signal">42.36° N</Mono>
              </div>
            </Plate>
          </div>

          {/* Map key, doing the job a feature grid usually botches. */}
          <div className="mrd-legend">
            {LEGEND.map(item => (
              <div className="mrd-legend-item" key={item.title}>
                <span className="mrd-legend-sym">{item.glyph}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Route ── */}
      <section className="mrd-section">
        <div className="mrd-shell">
          <SectionIndex num="01" name="The route" />
          <div className="mrd-route">
            {ROUTE.map(step => (
              <div className="mrd-station" key={step.num}>
                <Mono tone="signal">{step.num}</Mono>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What we do ── */}
      <section className="mrd-section">
        <div className="mrd-shell">
          <SectionIndex num="02" name="What we do" />
          <div className="mrd-split">
            <Plate className="mrd-split-img">
              <img src={WORK_IMG} alt="Community volunteers working together" />
            </Plate>
            <div>
              <h2 className="mrd-h1">A platform for what is possible.</h2>
              <p className="mrd-lede" style={{ marginTop: 18 }}>
                We connect volunteers with vetted local organizations, minus the paperwork,
                the cold emails, and the waiting to hear back.
              </p>
              <ul className="mrd-feature-list">
                {FEATURES.map(f => (
                  <li className="mrd-feature" key={f.num}>
                    <span className="mrd-feature-num">{f.num}</span>
                    <div>
                      <h3>{f.title}</h3>
                      <p>{f.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Organizations ── */}
      <section className="mrd-band">
        <div className="mrd-shell">
          <SectionIndex num="03" name="For organizations" />
          <div className="mrd-band-head">
            <h2 className="mrd-h1">Post a shift. Fill it by Friday.</h2>
            <p className="mrd-lede">
              List a single event or build a full volunteer page in minutes. Verified,
              searchable, and free to start.
            </p>
          </div>

          <div className="mrd-offer-grid">
            <Plate as={Link} to="/signup?role=organization" className="mrd-offer">
              <Mono>01 · Quick post</Mono>
              <h3>Create an event</h3>
              <p>
                A single shift, a recurring need, or a whole campaign, posted in under three
                minutes. Volunteers find it, sign on, and show up.
              </p>
              <span className="mrd-offer-go">Create event <Arrow /></span>
            </Plate>

            <Plate as={Link} to="/signup?role=organization" className="mrd-offer mrd-offer--signal">
              <Mono>02 · Full profile</Mono>
              <h3>Register your organization</h3>
              <p>
                Claim a verified profile, manage your team, track impact hours, and build
                recurring partnerships with volunteers who already live nearby.
              </p>
              <span className="mrd-offer-go">Register organization <Arrow /></span>
            </Plate>
          </div>
        </div>
      </section>

      {/* ── Volunteers ── */}
      <section className="mrd-section">
        <div className="mrd-shell">
          <SectionIndex num="04" name="For volunteers" />
          <h2 className="mrd-h1">Three ways in.</h2>
          <div className="mrd-dir">
            {DESTINATIONS.map(d => (
              <Link className="mrd-dir-row" to={d.to} key={d.num}>
                <Mono tone="signal">{d.num}</Mono>
                <div>
                  <h3>{d.title}</h3>
                  <p>{d.body}</p>
                </div>
                <span className="mrd-dir-go"><Arrow size={15} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
