# 06 — Final additions: Filipino, sound, Ilista mo, numbers

Added Nov 22, after we compared Tingi with the other groups' live sites.
Images are in `screenshots/` (`41-…` to `46-…`).

## Why

All three other groups' sites had a Filipino/English switch, two had sound,
and one let visitors take part (lighting a candle). Tingi already turned
reading into buying through the window, but the visitor could not *add*
anything, and the site was in English only. We chose four additions that fit
our store instead of copying their look.

## What changed, and the element or principle it shows

### FIL / ENG switch — `screenshots/41-final-home-filipino.png`, `44-final-story-filipino.png`, `45-final-phone-popup-filipino.png`
Every page, the pop-ups, form messages, alt text and page titles now come in
Filipino and English. The choice is remembered on the next visit.
**Harmony**: the same store, the same signs, in the language of the people
it is about. The cited quotes from our sources stay in their original English.
The Filipino text should be proofread by the group before the final presentation.

### Store sounds, off by default — `screenshots/46-final-nav-language-sound.png`
A *Tunog* button turns on small sounds made in the browser: the piso on the
counter, the product set on the ledge, a page of the listahan turning, the
"Nabili na" stamp, the shutter rattling open, a bell when all five stories are
read, and the order slip tearing off.
**Rhythm** and **emphasis**: the sounds mark each step of buying a story.

### Ilista mo — `screenshots/43-final-paninda-ilista.png`
On Paninda, visitors can write one line in the tindera's notebook: a memory of
their own suki store. It is saved only in their browser, and the page says so.
This answers the "collective stories" part of the brief: visitors add their
own stories to the store's.
**Line** and **texture**: the ruled listahan paper, with entries in handwriting.

### Sa mga numero — `screenshots/42-final-tungkol-numbers.png`
On Tungkol, four price tags with sourced figures count up as they scroll into
view: over 1.3 million sari-sari stores, 15–20% of the retail market, 8.3% of
the informal workforce (DTI's 2025 retail blueprint, as reported by
BusinessWorld), and 164 million sachets thrown away a day (GAIA, 2019).
**Proportion** and **emphasis**: big painted numbers; the sachet tag is set
apart in red as the critique.

## What we checked

- Every page in both languages at 1440×900, 1366×657, 390×844 and 360×640:
  no sideways scrolling, no console errors, never both languages at once.
- Switching language while a story is open rewrites the open story.
- Sound stays off until the visitor turns it on; the choice is remembered.
- The notebook entry is saved, restored after a reload, and can be erased.

## After the design critique (Nov 22)

A second critique of the whole live site scored it 29/40 and found these
problems, which we then fixed. Images: `screenshots/47-…` to `50-…`.

| Problem | What we changed |
|---|---|
| Filipino figures on Tungkol spilled out of their price tags; screen readers heard "0" until scrolled | The unit ("milyon+") sits on its own smaller line; screen readers get the real figure — `49-final-tungkol-numbers-v2.png` |
| The header wrapped onto two rows on small phones and tablets | Below 860px the links fold into the menu; on phones one language button names the language you can switch to; all header buttons are 44px |
| ENG mode showed Filipino words with no translation; some labels stayed English in FIL | Small English glosses (e.g. "Tungkol · About", "Pinagkunan · Sources"); every label now follows the switch |
| Filipino wording flagged by the review | e.g. "matitingkad na pakete", "nakasalalay sa tiwala", "gamit nang sachet", "Ekonomiyang sachet" used everywhere |
| Reading all five stories had a weak ending | The tindera hands over a *resibo* of the five stories, paid with *tiwala*, with links to Ilista mo and Pabili — `47-final-home-resibo.png` |
| The Sachet critique looked like the other stories | Greyer paper, a torn red seal, price tags comparing the cost per gram, and a band of litter with GAIA's figure — `48-final-sachet-critique.png`, `50-final-phone-critique-popup.png` |
| Small fixes | Source notes and focus rings readable on their backgrounds; the erase button is 44px with a drawn icon; the double outline on the Pabili choices is gone; the notebook lines stop at the pop-up photo |
