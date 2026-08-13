/* ═══════════════════════════════════════════════════════════════════════
   Brand colour — the two hues a visitor can change from the switcher.

   Only the tunable designs (00 Default, 01 Prototype) read these. The four
   authored looks — Vesper, Classic, Atlas, Dispatch — carry hand-tuned
   palettes where a swapped hue would break the intent, so they ignore them.

   Two roles, and they are not interchangeable:

     primary    buttons, links, focus rings, active nav, meter fill.
                Everything you can act on.
     secondary  the second stop in hero gradients, section accents,
                decorative rules and glows. Never the only carrier of
                meaning, because it is free to be light or dark.

   Everything else (hover states, soft tints, borders) is derived in CSS
   from these two with relative colour syntax, so each theme decides how far
   to push the same input. The one thing JS owns is the ink that sits *on*
   the colour, because "is white or near-black more readable here" is a
   contrast calculation, not a hue shift.
   ══════════════════════════════════════════════════════════════════════ */

export const BRAND_KEY = 'benevola_brand';

/** Near-black rather than #000: pure black on a saturated fill reads as a hole. */
const DARK_INK = '#14151A';
const LIGHT_INK = '#FFFFFF';

/* Chroma is kept inside sRGB at each lightness, so the OKLCH derivations in
   the theme stylesheets stay predictable instead of silently clipping. */
export const BRAND_PRESETS = [
  { id: 'iris',   name: 'Iris',   primary: '#7B53DD', secondary: '#19D1D2' },
  { id: 'meadow', name: 'Meadow', primary: '#157C4F', secondary: '#A3CF64' },
  { id: 'tide',   name: 'Tide',   primary: '#006EB1', secondary: '#51D5CE' },
  { id: 'ember',  name: 'Ember',  primary: '#C76A18', secondary: '#EB5169' },
  { id: 'plum',   name: 'Plum',   primary: '#B91A96', secondary: '#FD8358' },
];

export const DEFAULT_BRAND = {
  primary:   BRAND_PRESETS[0].primary,
  secondary: BRAND_PRESETS[0].secondary,
};

const HEX = /^#[0-9a-f]{6}$/i;

/** `<input type="color">` only ever emits #rrggbb, but storage and URLs lie. */
export function normalizeHex(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const v = value.trim();
  if (HEX.test(v)) return v.toUpperCase();
  // Accept #abc shorthand so a hand-typed value in localStorage still works.
  if (/^#[0-9a-f]{3}$/i.test(v)) {
    return ('#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]).toUpperCase();
  }
  return fallback;
}

function relativeLuminance(hex) {
  const channel = (i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function contrast(a, b) {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Whichever of white / near-black is more readable on top of `hex`. */
export function inkOn(hex) {
  return contrast(hex, LIGHT_INK) >= contrast(hex, DARK_INK) ? LIGHT_INK : DARK_INK;
}

export function readStoredBrand() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = {
      primary:   params.get('primary'),
      secondary: params.get('secondary'),
    };
    /* A preset name in the URL beats loose hexes: ?brand=meadow is the
       shareable form, ?primary=…&secondary=… the precise one. */
    const preset = BRAND_PRESETS.find(p => p.id === params.get('brand'));
    if (preset) return { primary: preset.primary, secondary: preset.secondary };
    if (fromUrl.primary || fromUrl.secondary) {
      return {
        primary:   normalizeHex(fromUrl.primary,   DEFAULT_BRAND.primary),
        secondary: normalizeHex(fromUrl.secondary, DEFAULT_BRAND.secondary),
      };
    }
    const stored = JSON.parse(localStorage.getItem(BRAND_KEY) || 'null');
    if (stored) {
      return {
        primary:   normalizeHex(stored.primary,   DEFAULT_BRAND.primary),
        secondary: normalizeHex(stored.secondary, DEFAULT_BRAND.secondary),
      };
    }
  } catch { /* private mode, SSR, malformed JSON — the default is fine */ }
  return { ...DEFAULT_BRAND };
}

/** Paint the four variables the tunable themes build everything else from. */
export function applyBrand(brand) {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', brand.primary);
  root.style.setProperty('--brand-secondary', brand.secondary);
  root.style.setProperty('--brand-primary-ink', inkOn(brand.primary));
  root.style.setProperty('--brand-secondary-ink', inkOn(brand.secondary));
}

export function matchPreset(brand) {
  return BRAND_PRESETS.find(
    p => p.primary === brand.primary && p.secondary === brand.secondary
  )?.id ?? null;
}
