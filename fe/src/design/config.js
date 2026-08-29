/* ───────────────────────────────────────────────────────
   Design variant configuration.

   The site is LOCKED to 'default'. The switcher is gone, and the design is
   not readable from the URL or localStorage — every route renders the one
   design, in the brand colours set in ./brand.js.

   BRINGING BACK A SHELVED LOOK
   ----------------------------
   The other five designs are archived under src/OldThemes/, not deleted.
   To restore one:

     1. Move its folder back to src/variants/ (the relative import depth is
        the same in both places, so nothing inside it needs editing).
        'classic' also needs OldThemes/Pages, OldThemes/Components and
        OldThemes/styles moved back alongside it.
     2. Add its import and BY_DESIGN entry in ./registry.js.
     3. Add its entry to DESIGNS below.

   To let visitors choose again, set LOCKED back to null and restore
   DesignSwitcher (deleted — recover it from git history).

   Light/dark is not a stored preference: it follows the operating system.
   See src/design/DesignContext.jsx.

   NOTE: EventNew lives in src/shared and is served to every design by the
   registry.
   ────────────────────────────────────────────────────── */

/** null = let the visitor choose. A design id = hard lock. */
export const LOCKED = 'default';

/** Used on first visit, before anyone has picked anything. */
export const DEFAULT_DESIGN = 'default';

/* `tunable: true` means the design builds its palette from the brand colours
   in ./brand.js rather than carrying a hand-tuned one. `theme` records which
   mode the design was drawn for; nothing reads it now that light/dark follows
   the operating system, but it is what a restored switcher would open in. */
export const DESIGNS = [
  {
    id:      'default',
    name:    'Default',
    label:   '00',
    tagline: 'Open daylight — flat brand band, soft cards, your colour',
    theme:   'light',
    tunable: true,
  },
];

export const DESIGN_IDS = DESIGNS.map(d => d.id);
