# 04 — Storefront v2: a real, crowded tindahan

Reworked Nov 15 after our professor's feedback on the homepage (Tindahan).
Captured from the local files (Chrome headless). Images are in `screenshots/`.

## The feedback

> Make the sari-sari store look more like a real tindahan in the Philippines:
> more crowded and immersive, with a window at the bottom middle where the
> products and the payment go through. Add animations if needed.

## Before and after

| | Before (v1, Nov 9) | After (v2, Nov 15) |
|---|---|---|
| Screenshot | `screenshots/03-site-home.png` | `screenshots/13-storefront-v2-desktop.png`, `screenshots/14-storefront-v2-phone.png` |
| Shelves | Two tidy shelves with a few plain blocks | Two packed shelves, each with a back row and a narrow inner shelf behind it |
| Goods | Plain coloured shapes | Drawn goods: sardinas, noodles, softdrinks, toyo/suka, garapon, eggs, soap (made-up labels, no real brands) |
| Grill | Plain dark upright bars | A light wire grid in a pale frame, like the white grills on real stores (`assets/img/fieldwork/rehas.jpg`) |
| Buying | The product jumped straight into its story | A piso goes in through the window, the tindera inside hands the product out, and the story comes out of the window |
| Around the store | Signboard, awning, counter strip | Hanging sachets and chichirya, tarps, a bulb, a painted wall ad, and the street: bangko, cat, crates, gallon, rice sack, tsinelas |

We used our reference photos in `assets/img/fieldwork/` (`storefront.jpg`,
`rehas.jpg`, `shelf.jpg`) to decide what to add: the mesh grill, the framed
opening right above the ledge, the goods hanging behind the grill, the posters
under the awning and the lettering painted on the wall.

## What changed, and the element or principle it shows

### The pass-through window — `screenshots/15-storefront-v2-buying.png`
The opening in the grill sits at the bottom middle, right above the ledge, with
the tindera herself inside, in the lit store, and a "Tao po? Kumatok lang." note
above it. (Our first try showed only a hand in a dark opening; it looked out of
place, so we lit the inside and drew the tindera, as in real store photos.) Picking a
product plays a short purchase: the piso goes in, she takes it, the product
leaves its shelf and she holds it out, and the story page grows out of the
window.
**Emphasis**: the window is the one framed shape with a face in a busy scene,
and the motion leads the eye to it. **Balance**: it is centred, with Utang above it and
two products on each side.

### Crowded shelves — `screenshots/13-storefront-v2-desktop.png`
Every shelf now has three depths: the front row, a darker back row, and a
smaller, darker inner shelf behind that.
**Space**: the store is full, like a real tindahan, but the five story products
keep their own room, a name tag and a pool of light. **Perspective**: things
further back are smaller and darker, and the shelf tops still narrow toward the
back wall. **Form**: cans, bottles, jars and packs are drawn as solid objects.
**Proportion**: the five stories are the biggest, brightest things on the shelf.

### Hanging goods and the mesh grill
Sachet ribbons, chichirya and saging hang across the top, with more strips of
sachets down both sides; the grill is a light wire grid in a pale frame.
**Rhythm**: the repeated ribbons and the mesh's small squares. **Line**: the
frame's two uprights stand either side of the window, and the rail runs along
the shelf line, so no bar crosses a product or its name tag. **Texture**: mesh,
plywood, painted concrete and plastic.

### Signs, wall and street
"Load na dito", "Cash in · Cash out · Bills · E-load", "Ice candy for sale",
"Bawal ang utang, bukas pwede." and
the painted "Malamig na softdrinks" are the kind of hand-made signs our Signs &
labels story is about. The tindera's "Ano po'ng sa inyo?" is now a speech bubble
coming from the window. Below the ledge is the street: a bangko with a sleeping
cat (our Tambayan story), softdrink crates, a water gallon, a rice sack and a
pair of tsinelas.
**Harmony**: everything uses the same five-colour palette and three typefaces
as the rest of the site.

### Movement
- The purchase through the window (above). The first one plays in full; later
  ones are quicker, so reading all five stories does not feel slow.
- Hanging goods sway slightly, the bulb's light breathes, the cat's tail flicks.
- After the shutter lifts on the first visit, the five story products hop once
  to show which ones can be picked.
- The layers shift a little as the mouse moves: goods clipped to the outside of
  the grill move most, the back rows least (**perspective**).

All of it stops when the store is scrolled out of view, and none of it plays for
visitors whose device is set to reduce motion.

## What we checked

- All five story products are visible on the first screen at 1280×800,
  1440×900, 768×1024, 390×844 and 360×740, with no sideways scrolling.
- The story pop-up still works with mouse, keyboard (Enter, arrow keys, Escape)
  and touch, and focus returns to the product after closing.
- Text on the new signs meets the 4.5:1 contrast ratio.
