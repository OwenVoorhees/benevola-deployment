# Design variants

The site ships six complete looks. Routes name a *surface* (`Landing`,
`Events`, `Event`, …); the active design decides which component renders it.

| # | id | name | look |
|---|---|---|---|
| 00 | `default` | Default | open daylight: light ground, a diagonal brand wash behind the hero, soft cards, pill buttons |
| 01 | `prototype` | Prototype | night studio: near-black ground, heavy display type, colour arriving in whole blocks |
| 02 | `vesper` | Vesper | civic poster printed at night: deep petrol ground, Fraunces display serif, clay accent |
| 03 | `classic` | Classic | the original green-and-white build, untouched |
| 04 | `atlas` | Atlas | working surface: indigo, lists rather than card grids, daylight |
| 05 | `dispatch` | Dispatch | public notice: paper, heavy ink, vermilion |

Every design commits to a scene and also ships the inverted mode, so the
theme toggle keeps working in all six.

## Brand colour (00 and 01 only)

`default` and `prototype` are **tunable**: they build their entire palette,
neutrals included, out of two variables that the switcher writes onto `:root`.

```
--brand-primary     buttons, links, focus rings, active nav, meter fill
--brand-secondary   gradient second stop, section accents, glows
```

The switcher shows a colour picker whenever one of them is active. Values live
in `localStorage` under `benevola_brand`; presets and the contrast maths are in
[`brand.js`](./brand.js).

The other four designs deliberately ignore these: their palettes carry meaning
(Dispatch's vermilion, Vesper's clay) that a swapped hue would destroy. Mark a
new design tunable by adding `tunable: true` to its entry in `config.js` and
deriving its tokens from `--brand-*`.

### Two rules when writing a tunable theme

1. **Fills and text are different tokens.** A picked colour is only safe under
   the ink `brand.js` computed for it (`--brand-primary-ink`). As *text* on the
   page ground it can fall to 3.6:1, so links and icons use a
   pinned-lightness variant (`--def-pri-text`, `--ptp-accent`) instead.
2. **No `calc()` with relative-colour channel keywords.** CRA's CSS minifier
   cannot parse `calc(l - 0.07)` and fails the production build. Use a literal
   lightness (`oklch(from var(--brand-primary) 0.48 c h)`) or `color-mix()`.

## Switching

- **In the browser** — the pill in the bottom-right corner, or `Ctrl/Cmd + Shift + D`.
- **By URL** — `?design=vesper` on any page. Overrides the stored choice.
  Tunable designs also accept `?brand=meadow` or `?primary=%23157C4F&secondary=%23A3CF64`.
- **Stored** — the last choice is kept in `localStorage` under `benevola_design`.

`public/index.html` reads the same values — design, theme *and* brand colour —
before React boots, so the correct ground is painted on the first frame instead
of flashing. Its design list and brand fallbacks have to stay in sync with
`config.js` and `brand.js`.

## Making one permanent

Set `LOCKED` in [`config.js`](./config.js):

```js
export const LOCKED = 'default';
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

Add a `[data-design='<name>']` block to [`../shared/ui.css`](../shared/ui.css)
mapping your tokens onto the `--ui-*` bridge, or the three shared surfaces
(posting an event, password recovery) will render in the fallback palette.

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
