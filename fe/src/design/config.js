/* ─────────────────────────────────────────────────────────────────────
   Design variant configuration.

   MAKING A CHOICE PERMANENT
   -------------------------
   Set LOCKED to a design id below. The switcher disappears and every route
   renders that design, regardless of what is in localStorage or the URL.

       export const LOCKED = 'default';

   REMOVING A DESIGN FOR GOOD
   --------------------------
   1. Delete its folder under src/variants/ (or, for 'classic', delete
      src/Pages/ and src/Components/).
   2. Delete its entry from the DESIGNS array below.
   3. Delete its import and column from src/design/registry.js.

   Nothing else in the app imports variant files directly, so those three
   steps are the whole job.

   NOTE: EventNew, ForgotPassword and ResetPassword live in src/shared and
   are served to every design by the registry. A design only needs its own
   version of those if it wants to override them.
   ──────────────────────────────────────────────────────────────────── */

/** null = let the visitor choose. A design id = hard lock, switcher hidden. */
export const LOCKED = null;

/** Used on first visit, before anyone has picked anything. */
export const DEFAULT_DESIGN = 'default';

/* `tunable: true` means the design builds its palette from the brand colours
   in src/design/brand.js, so the switcher offers a colour picker while it is
   active. The four authored looks below it are fixed on purpose: their
   palettes carry meaning that a swapped hue would destroy. */
export const DESIGNS = [
  {
    id:      'default',
    name:    'Default',
    label:   '00',
    tagline: 'Open daylight — gradient band, soft cards, your colour',
    theme:   'light',
    tunable: true,
  },
  {
    id:      'prototype',
    name:    'Prototype',
    label:   '01',
    tagline: 'Night studio — near-black, colour blocks, your colour',
    theme:   'dark',
    tunable: true,
  },
  {
    id:      'vesper',
    name:    'Vesper',
    label:   '02',
    tagline: 'Nocturne — deep petrol, poster serif, clay',
    theme:   'dark',
  },
  {
    id:      'classic',
    name:    'Classic',
    label:   '03',
    tagline: 'The original green-and-white build',
    theme:   'light',
  },
  {
    id:      'atlas',
    name:    'Atlas',
    label:   '04',
    tagline: 'Working surface — indigo, lists, daylight',
    theme:   'light',
  },
  {
    id:      'dispatch',
    name:    'Dispatch',
    label:   '05',
    tagline: 'Public notice — paper, heavy ink, vermilion',
    theme:   'light',
  },
];

export const DESIGN_IDS = DESIGNS.map(d => d.id);

export const TUNABLE_IDS = DESIGNS.filter(d => d.tunable).map(d => d.id);

export const STORAGE_KEY = 'benevola_design';
export const THEME_KEY   = 'theme';
