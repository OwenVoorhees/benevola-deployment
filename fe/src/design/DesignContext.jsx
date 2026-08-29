import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { LOCKED, DEFAULT_DESIGN } from './config';

/* Holds the two things the shell still needs to know: which design is mounted
   (one, fixed) and whether the visitor is in light or dark mode.

   The design switcher and its colour picker were removed for deployment, so
   there is no setter for the design any more: it is fixed in ./config.js and
   the brand colours live in the stylesheet, at
   variants/default/css/tokens.css.

   Light/dark is not a setting either. It follows the operating system, live —
   there is no header toggle and nothing is persisted, so a visitor who flips
   their machine to dark at sunset sees the site follow without touching it. */

const DesignContext = createContext(null);

const DESIGN = LOCKED ?? DEFAULT_DESIGN;

const DARK_QUERY = '(prefers-color-scheme: dark)';

function systemTheme() {
  try {
    return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
  } catch {
    /* no matchMedia — jsdom without a stub, an ancient browser. Light is the
       design's own default, so falling back to it changes nothing. */
    return 'light';
  }
}

export function DesignProvider({ children }) {
  const [theme, setTheme] = useState(systemTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-design', DESIGN);
  }, []);

  /* Subscribe rather than read once: the OS preference can change while the
     tab is open (a scheduled switch at dusk, someone toggling it by hand). */
  useEffect(() => {
    let mq;
    try { mq = window.matchMedia(DARK_QUERY); } catch { return undefined; }

    const onChange = e => setTheme(e.matches ? 'dark' : 'light');
    setTheme(mq.matches ? 'dark' : 'light');

    /* addListener is the Safari < 14 spelling; it is still the only one there. */
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value = useMemo(() => ({ design: DESIGN, theme }), [theme]);

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesign() {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error('useDesign must be used inside <DesignProvider>');
  return ctx;
}
