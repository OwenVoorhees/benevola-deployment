/* MERIDIAN — field guide. Paper ground, hairline rules, contour lines,
   monospace metadata, one signal orange doing all the wayfinding.

   The stylesheet is imported here so that deleting this folder removes the
   design completely: nothing outside src/design/registry.js knows it exists. */

import './meridian.css';

export { default as Landing }   from './pages/Landing';
export { default as Events }    from './pages/Events';
export { default as Event }     from './pages/Event';
export { default as EventNew }  from './pages/EventNew';
export { default as Orgs }      from './pages/Orgs';
export { default as Org }       from './pages/Org';
export { default as Volunteer } from './pages/Volunteer';
export { default as About }     from './pages/About';
export { default as NotFound }  from './pages/NotFound';
export { Login, Signup }        from './pages/Auth';
