/* The one and only place that knows which files belong to which design.

   Every design folder exports the same set of named surfaces. To drop a
   design, delete its folder and remove its two lines here. */

import * as classic  from '../variants/classic';
import * as meridian from '../variants/meridian';
import * as vesper   from '../variants/vesper';

import { DEFAULT_DESIGN } from './config';

const BY_DESIGN = { classic, meridian, vesper };

/** Route key -> exported component name. Both designs export all of these. */
export const SURFACES = [
  'Landing', 'Events', 'Event', 'EventNew', 'Orgs', 'Org',
  'Volunteer', 'Login', 'Signup', 'About', 'NotFound',
];

export function resolveSurface(design, surface) {
  return BY_DESIGN[design]?.[surface]
      ?? BY_DESIGN[DEFAULT_DESIGN]?.[surface]
      ?? Object.values(BY_DESIGN).find(d => d?.[surface])?.[surface]
      ?? null;
}
