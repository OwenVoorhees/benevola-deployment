# Homepage photographs

Two sets of pictures, both referenced from
`src/variants/default/pages/Landing.jsx`. Anything in `public/` is copied to
the site root at build time, so `/home/hero.jpg` resolves once the file exists.

**Until a file exists the tile renders as a flat brand-green block**, not a
broken-image glyph, so the page never looks broken while you are still
gathering photos. Drop them in one at a time if you like.

## The hero shot

    public/home/hero.jpg

Sits beside the headline, with the live-openings card overlapping its bottom
edge. Landscape, cropped to **16:10** — the tile crops to that with
`object-fit: cover`, so anything important should be away from the very bottom
right, which the card covers.

Renders about 540px wide, so **1200x750** is plenty. It loads eagerly because
it is the first thing on the page: keep it under ~250KB.

If you change what it shows, change the `alt` text in `Landing.jsx` with it.
It currently says "Volunteers sorting donations at a community food bank".

## The cause band

Six **square** photos under the hero, one per cause:

    public/home/causes/food-security.jpg
    public/home/causes/environment.jpg
    public/home/causes/animal-welfare.jpg
    public/home/causes/education.jpg
    public/home/causes/housing.jpg
    public/home/causes/health-wellness.jpg

The names come from `CAUSES` in `Landing.jsx` — change that list and rename the
files to match. They render at about 170px, so **500x500** is ample and ~80KB
each is a fair budget. They are lazy-loaded, and each has its cause name
printed underneath, so the picture is never the only label.

## Licensing

These go on a public page, so use photos you have the right to publish:
something the team shot, or a permissive stock source. Check whether the
licence asks for attribution before you commit the file — if it does, the
credit belongs on the About page.

Avoid photos of identifiable people who have not agreed to appear on the site.

## Before you commit

Square the cause shots and crop the hero to 16:10 yourself rather than leaving
it to `object-fit` — you choose the crop that way. JPEG at ~80% quality is
plenty for all seven.
