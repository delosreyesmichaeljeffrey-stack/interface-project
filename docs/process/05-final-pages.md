# 05 — Finishing the rest of the site

Done Nov 15, after the storefront rework (`04-storefront-v2.md`). Captured from
the local files at 1440×900 (Chrome headless). Images are in `screenshots/`.

## What was unfinished, and what we did

| Where | Before | Now |
|---|---|---|
| Tambayan story | "Sources for this story will be listed here." and a note to ourselves as the last paragraph | Two sources we opened and read, quoted in the text, and a real ending |
| Utang story | Empty "Litrato soon" frame | A photo of a tindera and a customer (Samal, Davao) |
| Paninda wall | Empty "Ang tindera" frame; phones showed only 3 of the photos | A photo of two women at their store counter (Cavite); all six photos on every screen |
| Story pop-up on the homepage | Two sentences and a text link | Two sentences, the story's photo, and a "Read the full story" button |
| Story pages on small phones | The page scrolled sideways (long DOI addresses in the sources did not wrap) | Fixed |

### Photos: where they come from
We found no openly licensed photo of a real *listahan* page, so the Utang story
uses a photo of a tindera with a customer instead, captioned for what it shows.
Both new photos are from Wikimedia Commons under CC BY 2.0, credited under the
picture and in the credits list on `tungkol.html`:

- `assets/img/fieldwork/tindera.jpg`: "Sari-Sari Store Cavite.jpg" by Glen (cropped)
- `assets/img/fieldwork/story-utang.jpg`: "Sari-Sari Store Samal Davao.jpg" by Burgermac (resized)

All photos on the site are stand-ins from other people. Our own fieldwork
photos would still be stronger evidence.

### Tambayan sources: how far each was checked
- Prieto et al. (2026), *Acta Medica Philippina* 60(15), 61–72: full article
  read. The quoted lines ("more than a site for economic transactions; it is
  also a social space", "people meet, drink, smoke, and gossip") are on p. 62.
- Turgo (2013), *Singapore Journal of Tropical Geography* 34(3), 373–389: only
  the **abstract** was read (the full article is behind a paywall). "Eyes and
  ears of the community" is in the abstract.

## Screens, and the element or principle each shows

### Paninda — `screenshots/16-final-paninda.png`
The store's striped awning now runs under the header on every inner page
(**harmony**, **rhythm**): you stay around the same store. The photo wall is
six taped photos, each tilted a little (**texture**, **balance**).

### Photo viewer — `screenshots/21-final-photo-viewer.png`
Clicking or tapping a photo opens it larger with its caption and credit; the
picture travels from its frame into the viewer and back (**emphasis**). It also
opens with Enter and closes with Escape.

### Story pages — `screenshots/17-final-story-utang.png`, `screenshots/18-final-story-tambayan.png`
A red line fills the listahan's margin as you read (**line**). The photo, the
tindera's quote and the sources arrive once as they scroll into view.

### Story pop-up — `screenshots/22-final-story-popup.png`
The pop-up on the Tindahan is a preview: two sentences, the story's photo as a
small taped print, and one clear button to the full story (**proportion**).

### Tungkol — `screenshots/19-final-tungkol.png`
The price-board rows are chalked in one by one the first time they appear.

### Pabili! — `screenshots/20-final-pabili.png`
A pencil tick appears beside each field once it is filled in correctly. The
order slip is still a prototype and says so: it sends nothing.

## What we checked
- Every page at 360, 390, 768, 1280 and 1440 wide: no sideways scrolling, no
  broken images or links, no script errors.
- Keyboard use, the "reduce motion" setting (no movement), and JavaScript
  switched off (everything is still visible and the menu still works).
- Pabili! with empty and space-only fields, a very long name and message,
  Enter in a field and a double click on the button.
