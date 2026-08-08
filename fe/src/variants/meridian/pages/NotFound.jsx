import React from 'react';
import Shell from '../Shell';
import { Arrow, BtnLink, Mono } from '../parts';

export default function NotFound() {
  return (
    <Shell>
      <div className="mrd-shell mrd-topo">
        <div className="mrd-404">
          <Mono tone="signal">Off the sheet</Mono>
          <div className="mrd-404-code">404</div>
          <h1 className="mrd-h1">This page is not on the map.</h1>
          <p>
            The address you followed does not lead anywhere we survey. It may have moved,
            or it may never have existed.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <BtnLink to="/">Back to the start <Arrow /></BtnLink>
            <BtnLink to="/events" variant="ghost">Browse opportunities</BtnLink>
          </div>
        </div>
      </div>
    </Shell>
  );
}
