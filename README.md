# Tingi — The Sari-Sari Store as a Cultural Archive

A website you enter like a sari-sari store. Every product on the shelf opens a
story about Filipino community life.

## Run it

Open `index.html` in a browser. No build step needed.

## Structure

- `index.html`: storefront homepage (store sign, rehas window, shelves, counter)
- `paninda.html`: Paninda, the gallery of all five stories plus a wall for fieldwork photos
- `kwento/`: one full page per story (`tingi`, `utang`, `tambayan`, `signs`, `sachet`); write the full stories and sources here
- `tungkol.html`: Tungkol sa Tindahan, about the project and the team
- `pabili.html`: Pabili!, contact form styled as an order slip (prototype, sends nothing)
- `assets/css/style.css`: styles, palette and typography
- `assets/js/main.js`: opens each product's story
- `assets/js/kwento.js`: marks a story as read when its page is opened
- `assets/js/pabili.js`: order slip validation and receipt
- `404.html`: "Ubos na!" page for broken links
- `docs/process/`: design process documentation (moodboard, wireframe, screenshots)
