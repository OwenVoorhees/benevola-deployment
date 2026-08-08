import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DESIGNS, DESIGN_IDS, DEFAULT_DESIGN, LOCKED, STORAGE_KEY, THEME_KEY } from './config';

const DesignContext = createContext(null);

function readStoredDesign() {
  if (LOCKED) return LOCKED;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('design');
    if (fromUrl && DESIGN_IDS.includes(fromUrl)) return fromUrl;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && DESIGN_IDS.includes(stored)) return stored;
  } catch { /* private mode, SSR, whatever — fall through */ }
  return DEFAULT_DESIGN;
}

function readStoredTheme(designId) {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* ignore */ }
  return DESIGNS.find(d => d.id === designId)?.theme ?? 'light';
}

export function DesignProvider({ children }) {
  const [design, setDesignState] = useState(readStoredDesign);
  const [theme,  setTheme]       = useState(() => readStoredTheme(readStoredDesign()));

  useEffect(() => {
    document.documentElement.setAttribute('data-design', design);
    if (!LOCKED) {
      try { localStorage.setItem(STORAGE_KEY, design); } catch { /* ignore */ }
    }
  }, [design]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  /* Switching design snaps the page back to that design's native mode.
     Each design commits to a light or dark scene; the toggle is an override,
     not the starting point. */
  const setDesign = useCallback((id) => {
    if (LOCKED || !DESIGN_IDS.includes(id)) return;
    setDesignState(id);
    setTheme(DESIGNS.find(d => d.id === id)?.theme ?? 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({ design, setDesign, theme, setTheme, toggleTheme, locked: Boolean(LOCKED), designs: DESIGNS }),
    [design, setDesign, theme, toggleTheme]
  );

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesign() {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error('useDesign must be used inside <DesignProvider>');
  return ctx;
}
