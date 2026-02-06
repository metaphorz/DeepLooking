# Plan: Poem Popup Windows for Deep Looking

## Steps

- [x] Step 1: Add poem image generation to `generate_segmentation.py`
- [x] Step 2: Add poem data JS object + popup HTML/CSS/JS to `index.html`
- [x] Step 3: Run generation script and verify

## Review

### Changes made:
1. **`generate_segmentation.py`** — Added a poem image generation loop after the mask generation. For each of the 4 keywords (boardwalk, marsh, sky, water), it sends the poem text as a prompt to Gemini Pro and saves the resulting painterly illustration to `outputs/poem_*.png`.

2. **`index.html`** — Replaced the simple text tooltip with a larger popup panel containing:
   - Poem title (gold header)
   - Poet name (italic, gray)
   - Generated poem image (full-width, rounded corners)
   - Poem text excerpt
   - Smart viewport-aware positioning (flips left if near right edge, clamps vertically)
   - Dismisses when mouse leaves the region
   - Styled consistently with existing dark theme

### Generated files:
- `outputs/poem_boardwalk.png` — Herbert Morris "Boardwalk" illustration
- `outputs/poem_marsh.png` — Walt Whitman "Song of Myself" illustration
- `outputs/poem_sky.png` — Emily Dickinson "I Dwell in Possibility" illustration
- `outputs/poem_water.png` — Coleridge "Rime of the Ancient Mariner" illustration
- `outputs/segmentation_mask.png` — refreshed segmentation mask

## Files
- `generate_segmentation.py` — add poem image generation loop
- `index.html` — replace tooltip with popup panel (title, image, poem text)
- `Words.md` — read-only data source
