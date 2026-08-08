import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/** Page frame. Every Meridian surface starts here. */
export default function Shell({ children, bare }) {
  return (
    <div className="mrd">
      <Header />
      <main>{children}</main>
      {!bare && <Footer />}
    </div>
  );
}

export function Crumbs({ items }) {
  return (
    <nav className="mrd-crumbs" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && <span className="mrd-crumbs-sep">/</span>}
            {last || !item.to
              ? <span className={last ? 'mrd-crumbs-now' : undefined}>{item.label}</span>
              : <Link to={item.to}>{item.label}</Link>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
