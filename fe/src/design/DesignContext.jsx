import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DESIGNS, DESIGN_IDS, DEFAULT_DESIGN, LOCKED, STORAGE_KEY, THEME_KEY } from './config';
import {
  BRAND_KEY, DEFAULT_BRAND, applyBrand, matchPreset, normalizeHex, readStoredBrand,
} from './brand';

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
  const [brand,  setBrandState]  = useState(readStoredBrand);

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

  /* The variables go on :root unconditionally. Scoping is the stylesheets'
     job: only the tunable designs reference them, so an authored look is
     untouched even while a custom brand colour is stored. */
  useEffect(() => {
    applyBrand(brand);
    try { localStorage.setItem(BRAND_KEY, JSON.stringify(brand)); } catch { /* ignore */ }
  }, [brand]);

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

  const setBrandColor = useCallback((role, hex) => {
    setBrandState(b => ({ ...b, [role]: normalizeHex(hex, b[role]) }));
  }, []);

  const setBrand = useCallback(({ primary, secondary }) => {
    setBrandState(b => ({
      primary:   normalizeHex(primary,   b.primary),
      secondary: normalizeHex(secondary, b.secondary),
    }));
  }, []);

  const resetBrand = useCallback(() => setBrandState({ ...DEFAULT_BRAND }), []);

  const active = DESIGNS.find(d => d.id === design);

  const value = useMemo(
    () => ({
      design, setDesign, theme, setTheme, toggleTheme,
      locked: Boolean(LOCKED), designs: DESIGNS,
      brand, setBrand, setBrandColor, resetBrand,
      brandPreset: matchPreset(brand),
      /* Drives whether the switcher shows the colour section at all. */
      tunable: Boolean(active?.tunable),
    }),
    [design, setDesign, theme, toggleTheme, brand, setBrand, setBrandColor, resetBrand, active]
  );

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesign() {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error('useDesign must be used inside <DesignProvider>');
  return ctx;
}
