/* The one and only place that knows which files belong to which design.

   Every design folder exports the same set of named surfaces. To drop a
   design, delete its folder and remove its two lines here. */

/* `default` is a reserved word, so the 00 variant needs an alias here even
   though its id, folder and deep link are all plain "default". */
import * as defaultDesign from '../variants/default';
import * as prototype from '../variants/prototype';
import * as classic  from '../variants/classic';
import * as vesper   from '../variants/vesper';
import * as atlas    from '../variants/atlas';
import * as dispatch from '../variants/dispatch';

import { DEFAULT_DESIGN } from './config';

/* Surfaces that are the same job in every design: long forms and account
   recovery. They are written once against the --ui-* bridge in
   src/shared/ui.css and adopt whichever theme is mounted, so a new design
   never has to reimplement them. */
import EventNew       from '../shared/EventNewPage';
import ForgotPassword from '../shared/ForgotPasswordPage';
import ResetPassword  from '../shared/ResetPasswordPage';

const BY_DESIGN = {
  default: defaultDesign,
  prototype,
  vesper,
  classic,
  atlas,
  dispatch,
};

const SHARED = { EventNew, ForgotPassword, ResetPassword };

/** Route key -> exported component name. Every design exports all of these. */
export const SURFACES = [
  'Landing', 'Events', 'Event', 'EventNew', 'Orgs', 'Org',
  'Volunteer', 'Login', 'Signup', 'ForgotPassword', 'ResetPassword',
  'About', 'NotFound',
];

export function resolveSurface(design, surface) {
  // A design may still override a shared surface by exporting its own.
  return BY_DESIGN[design]?.[surface]
      ?? SHARED[surface]
      ?? BY_DESIGN[DEFAULT_DESIGN]?.[surface]
      ?? Object.values(BY_DESIGN).find(d => d?.[surface])?.[surface]
      ?? null;
}
