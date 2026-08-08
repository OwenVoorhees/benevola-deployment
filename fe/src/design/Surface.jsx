import React from 'react';
import { useDesign } from './DesignContext';
import { resolveSurface } from './registry';

/** Renders `name` in whichever design is currently active. */
export default function Surface({ name }) {
  const { design } = useDesign();
  const Component  = resolveSurface(design, name);

  if (!Component) {
    return (
      <div style={{ padding: '4rem 1.5rem', fontFamily: 'ui-monospace, monospace' }}>
        No component registered for surface “{name}”.
      </div>
    );
  }
  return <Component />;
}
