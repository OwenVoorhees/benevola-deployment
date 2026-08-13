import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { ArrowLink, Btn, Eyebrow } from '../parts';

export default function About() {
  return (
    <Shell>
      <div className="def-shell def-shell--narrow">
        <Eyebrow>About</Eyebrow>
        <h1 className="def-h1">Volunteering, without the runaround.</h1>

        <div className="def-prose" style={{ marginTop: 22 }}>
          <p>
            Most volunteering falls apart in the gap between wanting to help and
            finding something concrete to turn up to. Listings go stale, contact
            details bounce, and nobody knows how many people are actually coming.
          </p>
          <p>
            Benevola keeps that gap small. Organizations post a shift with a real
            date, a real place and a real capacity. Volunteers sign on, and both
            sides watch the roster fill.
          </p>
          <p>
            Free for volunteers. Free for the organizations doing the work.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 32, flexWrap: 'wrap' }}>
          <Btn as={Link} to="/events">Browse openings</Btn>
          <ArrowLink to="/signup?role=organization">Post an event</ArrowLink>
        </div>
      </div>
    </Shell>
  );
}
