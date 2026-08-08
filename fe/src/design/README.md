# Design variants

The site ships three complete looks. Routes name a *surface* (`Landing`,
`Events`, `Event`, …); the active design decides which component renders it.

| id | name | look |
|---|---|---|
| `classic` | Classic | the original green-and-white build, untouched |
| `meridian` | Meridian | field guide: warm paper, hairline rules, contour lines, monospace metadata, one signal orange doing all the wayfinding |
| `vesper` | Vesper | civic poster printed at night: deep petrol ground, Fraunces display serif, clay accent, photography duotoned into the palette |

Meridian and Vesper each commit to a scene (Meridian is daylight, Vesper is
night) and each also ships the inverted mode, so the header's theme toggle
keeps working in all three.

## Switching

- **In the browser** — the pill in the bottom-right corner, or `Ctrl/Cmd + Shift + D`.
- **By URL** — `?design=vesper` on any page. Overrides the stored choice.
- **Stored** — the last choice is kept in `localStorage` under `benevola_design`.

`public/index.html` reads the same values before React boots, so the correct
ground colour is painted on the first frame instead of flashing.

## Making one permanent

Set `LOCKED` in [`config.js`](./config.js):

```js
export const LOCKED = 'meridian';
```

The switcher disappears and every route renders that design regardless of URL
or storage. Nothing else needs to change.

## Deleting a design

Three steps, and no other file knows the design exists:

1. Delete its folder under `src/variants/` — for `classic`, delete
   `src/Pages/` and `src/Components/` too.
2. Remove its entry from `DESIGNS` in [`config.js`](./config.js).
3. Remove its two lines from [`registry.js`](./registry.js) (the import and
   the `BY_DESIGN` key).

Each variant imports its own stylesheet from its `index.js`, so the CSS goes
with the folder.

## Adding a design

Create `src/variants/<name>/index.js` exporting all ten surfaces by name
(`Landing`, `Events`, `Event`, `Orgs`, `Org`, `Volunteer`, `Login`, `Signup`,
`About`, `NotFound`), import its stylesheet there, then add it to `DESIGNS`
and `registry.js`.

You should not need to write any fetching or state logic: everything lives in
[`src/data/hooks.js`](../data/hooks.js) as headless hooks, and
[`src/data/api.js`](../data/api.js) owns every endpoint. A new design is JSX
and CSS only.

## Tests

[`surfaces.test.js`](./surfaces.test.js) renders all ten surfaces in every
registered design against a stubbed API and asserts each one mounts and
settles. It picks up new designs automatically.

```
npm test -- --testPathPattern=surfaces
```
