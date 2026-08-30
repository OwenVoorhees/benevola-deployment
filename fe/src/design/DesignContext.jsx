import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { LOCKED, DEFAULT_DESIGN } from './config';

/* Holds the two things the shell still needs to know: which design is mounted
   (one, fixed) and which theme it is in (light, fixed).

   The design switcher and its colour picker were removed for deployment, so
   there is no setter for the design: it is fixed in ./config.js and the brand
   colours live in the stylesheet, at variants/default/css/tokens.css.

   LIGHT ONLY, FOR NOW. The site did follow the operating system's light/dark
   preference; it is pinned to light while the dark palette is left alone. The
   dark rules are all still in the stylesheets, keyed on [data-theme='dark'],
   and nothing sets that attribute any more, so they are dormant rather than
   deleted. To bring the behaviour back, restore the matchMedia subscription
   here and the matching one in public/index.html — the CSS needs no changes.
   Both places have to agree, or the first painted frame is the wrong one. */

const DesignContext = createContext(null);

const DESIGN = LOCKED ?? DEFAULT_DESIGN;
const THEME  = 'light';

export function DesignProvider({ children }) {
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute('data-design', DESIGN);
    el.setAttribute('data-theme', THEME);
  }, []);

  /* Constant, but still built through useMemo so the value is referentially
     stable and consumers do not re-render on every parent render. */
  const value = useMemo(() => ({ design: DESIGN, theme: THEME }), []);

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesign() {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error('useDesign must be used inside <DesignProvider>');
  return ctx;
}
