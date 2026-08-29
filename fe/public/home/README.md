# Landing page photographs

Three files, referenced by `SHOT` in
`src/variants/default/pages/Landing.jsx`. Anything in `public/` is copied to
the site root at build time, so `/home/hero.jpg` resolves in the browser.

| File | Where it appears | Shipped at |
|---|---|---|
| `hero.jpg` | beside the headline, under the live-openings card | 1100x688 (16:10) |
| `community.jpg` | the tall picture in "Organizations post the work" | 1100x825 (4:3) |
| `organize.jpg` | the background of "Post a shift in about three minutes" | 1280x720 (16:9) |

These are the page's own pictures rather than listings' cover photos, because
the hero and the two bands have to look the same on every visit and survive an
empty database. The openings rail still shows each event's own photo — there,
the picture *is* the listing.

A missing file renders as a flat tinted tile with no broken-image glyph, so the
page degrades quietly if one is ever deleted. See `Photo` in
`src/variants/default/parts.jsx`.

## Where they came from, and the licence

All three are **public domain** works of the US federal government, from
Wikimedia Commons. Nothing to license, no credit line owed, and no expiry —
which is the same basis the event seeder uses for its cover photos, and the
reason both stick to Commons rather than a stock site.

| File | Commons source | Author |
|---|---|---|
| `hero.jpg` | [Volunteers at Yaquina Head (48832776418)](https://commons.wikimedia.org/wiki/File:Volunteers_at_Yaquina_Head_(48832776418).jpg) | BLM Oregon & Washington |
| `community.jpg` | [Coastal Clean Up Volunteers. (15010938649)](https://commons.wikimedia.org/wiki/File:Coastal_Clean_Up_Volunteers._(15010938649).jpg) | US EPA |
| `organize.jpg` | [Volunteers at Yaquina Head (48833146336)](https://commons.wikimedia.org/wiki/File:Volunteers_at_Yaquina_Head_(48833146336).jpg) | BLM Oregon & Washington |

`hero.jpg` and `organize.jpg` are from the same shoot — volunteers at Yaquina
Head Outstanding Natural Area on National Public Lands Day, 28 September 2019.
`community.jpg` is an Ocean Conservancy clean-up at Anacostia Park.

## Swapping one out

Two things to know if you replace one.

**Check the licence on the Commons file page.** Plenty of Commons images are
CC BY or CC BY-SA, which oblige you to credit the photographer somewhere a
visitor can see it. Only take one whose page says *Public domain* or *CC0*
unless you are prepared to add that credit — the About page is where it would
go.

**Commons renders thumbnails at a fixed set of widths only**, so you cannot
edit the number in a `/1280px-.../` URL to get the size you want; 1600 returns
an HTTP 400. Download a width Commons actually offers and resize locally.

Then crop to the ratio in the table above rather than leaving it to
`object-fit` — that way you choose what gets cut — and save at JPEG quality
~75. Each file above is 200–250KB, which is about the ceiling for three
photographs on one page.

**Avoid photos where an identifiable child is the subject.** A minor
incidental in a crowd is one thing; a portrait is another, and neither the
project nor the person consented to it.
