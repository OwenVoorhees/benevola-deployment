/* ─────────────────────────────────────────────────────────────────────
   Design variant configuration.

   MAKING A CHOICE PERMANENT
   -------------------------
   Set LOCKED to a design id below. The switcher disappears and every route
   renders that design, regardless of what is in localStorage or the URL.

       export const LOCKED = 'vesper';

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
export const DEFAULT_DESIGN = 'vesper';

export const DESIGNS = [
  {
    id:      'classic',
    name:    'Classic',
    label:   '00',
    tagline: 'The original green-and-white build',
    theme:   'light',
  },
  {
    id:      'vesper',
    name:    'Vesper',
    label:   '01',
    tagline: 'Nocturne — deep petrol, poster serif, clay',
    theme:   'dark',
  },
  {
    id:      'atlas',
    name:    'Atlas',
    label:   '02',
    tagline: 'Working surface — indigo, lists, daylight',
    theme:   'light',
  },
  {
    id:      'dispatch',
    name:    'Dispatch',
    label:   '03',
    tagline: 'Public notice — paper, heavy ink, vermilion',
    theme:   'light',
  },
];

export const DESIGN_IDS = DESIGNS.map(d => d.id);

export const STORAGE_KEY = 'benevola_design';
export const THEME_KEY   = 'theme';
