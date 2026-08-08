import '@testing-library/jest-dom';

/* jsdom in this Jest version predates these globals; react-router needs them. */
import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;

/* jsdom implements no layout, so these are missing rather than no-ops. */
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};
if (!window.matchMedia) {
  window.matchMedia = query => ({
    matches: false, media: query, onchange: null,
    addListener() {}, removeListener() {},
    addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false,
  });
}
