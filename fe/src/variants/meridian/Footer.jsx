import React from 'react';
import { Link } from 'react-router-dom';
import { SurveyMark, Mono } from './parts';

const COLUMNS = [
  {
    heading: 'Volunteers',
    links: [
      { label: 'Browse opportunities',  to: '/events' },
      { label: 'Browse organizations',  to: '/organizations' },
      { label: 'Create your profile',   to: '/signup' },
    ],
  },
  {
    heading: 'Organizations',
    links: [
      { label: 'Register your organization', to: '/signup?role=organization' },
      { label: 'Post an event',              to: '/login?role=organization' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About us', to: '/about' },
      { label: 'Contact',  href: 'mailto:benevolacorp@gmail.com' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mrd-foot">
      <div className="mrd-shell">
        <div className="mrd-foot-grid">
          <div className="mrd-foot-brand-col">
            <Link className="mrd-brand" to="/">
              <span className="mrd-brand-mark"><SurveyMark size={19} /></span>
              <span className="mrd-brand-name">Benevola</span>
            </Link>
            <p className="mrd-foot-blurb">
              Willing hands, plotted against the places that need them. Search by
              cause, distance, and the hours you actually have.
            </p>
          </div>

          {COLUMNS.map(col => (
            <div className="mrd-foot-col" key={col.heading}>
              <h4>{col.heading}</h4>
              <ul>
                {col.links.map(link => (
                  <li key={link.label}>
                    {link.to
                      ? <Link to={link.to}>{link.label}</Link>
                      : <a href={link.href} target="_blank" rel="noreferrer">{link.label}</a>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mrd-foot-bar">
          <Mono>© 2026 Benevola · Sheet 01</Mono>
          <Mono>Built for good · Privacy · Terms</Mono>
        </div>
      </div>
    </footer>
  );
}
