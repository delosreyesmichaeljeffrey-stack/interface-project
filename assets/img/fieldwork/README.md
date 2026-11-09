# Fieldwork photos

Put the photos from your sari-sari store visits in this folder.
Keep the originals somewhere else (`docs/process/photos/`). This folder is for
the web-sized copies the site actually loads.

## Before you photograph
- Ask the owner first, and ask again before you put a photo of a **person** online.
- Write down the owner's name, the store location and the date. The site and the
  documentation PDF need a photo credit.
- Do not show customers' names on a listahan page. Cover or crop them.

## Web-ready size
- JPG, about 1200 px wide (4:3 landscape looks best, it matches the frames).
- Under about 300 KB each. Use any free image compressor (squoosh.app works).
- Rename to lowercase with hyphens, like the list below.

## What the site is waiting for
| File name | Where it goes | What to shoot |
|---|---|---|
| `storefront.jpg` | Paninda photo wall | The storefront, with its sign and rehas |
| `rehas.jpg` | Paninda photo wall | Close-up of the grill window, where you buy |
| `shelf.jpg` | Paninda photo wall | A full shelf, packed with products |
| `tindera.jpg` | Paninda photo wall | The tindera at the counter (with permission) |
| `karatula.jpg` | Paninda photo wall | A painted sign or a handwritten notice |
| `tambayan.jpg` | Paninda photo wall | The bench outside, where people hang out |
| `story-tingi.jpg` | Tingi story | A row of hanging sachets, or a tindera measuring out one cup of rice |
| `story-utang.jpg` | Utang story | A page from a real listahan (names covered) |
| `story-tambayan.jpg` | Tambayan story | The bench and the people at the store |
| `story-signs.jpg` | Signs & labels story | A hand-painted signboard or notice |
| `story-sachet.jpg` | Sachet economy story | Empty sachets piled up after a week of use |

Also photograph the **price tags** of one sachet and the bigger pack of the same
product (shampoo, coffee). Those real prices replace the example prices in the
Sachet story.

## How a photo goes in
Each placeholder frame becomes a real photo by swapping its inner box. Change:

```html
<div class="photo-slot"><span class="photo-soon" ...>Litrato soon</span> ... </div>
```

to (on `paninda.html`):

```html
<div class="photo-slot has-photo"><img src="assets/img/fieldwork/storefront.jpg"
  alt="The storefront of a sari-sari store with a painted red sign and a grill window"
  width="1200" height="900" loading="lazy"></div>
```

On story pages (inside `kwento/`) use `../assets/img/fieldwork/...`.

Optional credit line under the caption:

```html
<span class="photo-credit">Photo: Your Name, store name, date</span>
```

Write the `alt` text as a real description of what is in the picture, for people
who cannot see it. Or just tell Claude "the photos are in the folder" and it will
wire them in.

---

## Current state (Nov 9)
Nine slots now use **openly licensed Wikimedia Commons photos** as stand-ins:
`storefront`, `rehas`, `shelf`, `karatula`, `tambayan`, `story-tingi`,
`story-tambayan`, `story-signs`, `story-sachet`. Their credits are under each
photo and in the "Mga litrato at pinagkunan" section of `tungkol.html`.
Originals are in `docs/TINGI_image/`.

Still placeholders (no suitable open-licensed photo found): the **tindera** frame on
Paninda and the **listahan** photo on the Utang story. These are best covered by
your own fieldwork photos.

When you replace a stand-in with your own photo, update the caption/credit under
it and remove that entry from the credits list on `tungkol.html`.
