/* ─────────────────────────────────────────────────────────────────────
   Design variant configuration.

   MAKING A CHOICE PERMANENT
   -------------------------
   Set LOCKED to a design id below. The switcher disappears and every route
   renders that design, regardless of what is in localStorage or the URL.

       export const LOCKED = 'meridian';

   REMOVING A DESIGN FOR GOOD
   --------------------------
   1. Delete its folder under src/variants/ (or, for 'classic', delete
      src/Pages/ and src/Components/).
   2. Delete its entry from the DESIGNS array below.
   3. Delete its column from the registry in src/design/registry.js.

   Nothing else in the app imports variant files directly, so those three
   steps are the whole job.
   ──────────────────────────────────────────────────────────────────── */

/** null = let the visitor choose. A design id = hard lock, switcher hidden. */
export const LOCKED = null;

/** Used on first visit, before anyone has picked anything. */
export const DEFAULT_DESIGN = 'meridian';

export const DESIGNS = [
  {
    id:      'classic',
    name:    'Classic',
    label:   '00',
    tagline: 'The original green-and-white build',
    theme:   'light',
  },
  {
    id:      'meridian',
    name:    'Meridian',
    label:   '01',
    tagline: 'Field guide — paper, hairlines, signal orange',
    theme:   'light',
  },
  {
    id:      'vesper',
    name:    'Vesper',
    label:   '02',
    tagline: 'Nocturne — deep petrol, poster serif, clay',
    theme:   'dark',
  },
];

export const DESIGN_IDS = DESIGNS.map(d => d.id);

export const STORAGE_KEY = 'benevola_design';
export const THEME_KEY   = 'theme';
