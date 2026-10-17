# Multi-Gallery Organization + LOC Classification

## Goal
1. Reorganize the project to support multiple galleries via a dropdown selector. The current gallery becomes "Proto Gallery by Paul Fishwick" under a new directory structure.
2. Add Library of Congress Classification (LCC) IDs to each lens, displayed at the bottom of the lens popup.

## Changes

### Directory Structure
- Create `galleries/` directory
- Move `images/` → `galleries/ProtoGallery_PaulFishwick/`
  - This includes all subdirectories (marsh, lourmarin, anhinga, minerals, cotan, cotan2) and `gallery.json`

### index.html Updates
- Add a gallery dropdown selector on the gallery screen
- Add a `galleries.json` at project root listing available galleries
- Update all path references from `images/` to `galleries/<selected-gallery>/`
- Show the gallery name/author on the gallery screen

### LOC Classification
- Add `loc:` metadata field to all 95 lens markdown files
- Display "LOC: <code>" at the bottom of each lens popup content

### LOC Mapping
| Lens | LOC Code |
|------|----------|
| anatomy | QM |
| ancienthistory | D |
| art | N |
| botany | QK |
| cinematography | PN1993 |
| cs | QA76 |
| ecology | QH540 |
| education | L |
| engineering | TA |
| geology | QE |
| hieroglyph | PJ1091 |
| history | D |
| hydrology | GB |
| language | P |
| math | QA |
| matsci | TA401 |
| mineralogy | QE351 |
| modeling | QA76.9.C65 |
| physics | QC |
| poetry | PN1010 |
| science | Q |

## TODO
- [x] Create `galleries/` directory
- [x] Move `images/` contents to `galleries/ProtoGallery_PaulFishwick/`
- [x] Create `galleries.json` at project root listing available galleries
- [x] Update `index.html` to add gallery dropdown and update path references
- [x] Add `loc` field to all 95 lens markdown files
- [x] Update `index.html` to pass `loc` through and display in popup
- [x] Test that everything still works
- [x] Review

## Review
### Gallery Reorganization
- Moved `images/` to `galleries/ProtoGallery_PaulFishwick/` (all contents intact)
- Created `galleries.json` at project root with one entry: Proto Gallery by Paul Fishwick
- Updated `index.html`:
  - Added `<select id="gallery-select">` dropdown with styled appearance
  - New `loadGalleries()` function reads `galleries.json`, populates dropdown, loads first gallery
  - New `loadGalleryImages(galleryId)` loads images from `galleries/<id>/gallery.json`
  - Dropdown change event switches galleries
  - All image/manifest paths now use `galleries/<id>/` prefix
- Verified working via localhost:8000 — all 5 images load, dropdown shows "Proto Gallery — Paul Fishwick"

### LOC Classification
- Added `loc:` metadata field to all 95 lens markdown files using LOC Classification codes
- Updated `index.html`:
  - Both segment lens and whole-image lens data builders now pass `loc` field
  - Added `locEl` div to popup content (styled italic, small, gray)
  - `showContent()` displays "LOC: <code>" at bottom of lens content
- Note: test scripts in `tests/` still reference old `images/` paths — these are utility scripts and can be updated as needed

---

# Second Gallery: Experimental Publishing — Roger Malina and Tina Chen

## Goal
Create a second gallery containing 4 student-submitted works (one image per student), each with multiple descriptive tabs sourced from the documents in `temp/`. Pattern follows the existing `pillow` gallery item: each image is treated as a single whole-image with multiple lens tabs (no segmentation mask).

## Source Material
| Student | Image | Document | Tabs found in document |
|---------|-------|----------|------------------------|
| Arman Eshtiaghi | `temp/Arman/Arman.jpg` (Brillo Box) | `Arman Brillo Test.1.docx` | Personal Perspective; Graphic Design & Typography; Marketing & Branding; Art History & Movements; Museum Studies & Archival Theory |
| Fatima Siddique | `temp/DeepLooking Fatima/Untold stories.jpg` (Karachi billboard) | `Untold Stories Artwork_Fatima Siddique (1).pdf` | History; Calligraphy; Crisis; Memory |
| Paul Monaco | `temp/DeepLooking Paul/Dragoon Mountains History.jpg` (Council Rocks pictograph) | `Deep Looking Excericse Step 2.docx` | Personal; Anthropology (LOC GN); Geology (LOC QE); Visual Arts (LOC N) |
| Sally | `temp/Sally/Cathedral-Saigon-Under-Construction.jpg` | `DeepLooking_Exercise2 (1).pdf` | Personal; History; Mathematics; Architecture |

## Proposed Structure
```
galleries/ExperimentalPublishing_MalinaChen/
├── gallery.json                # ["arman", "fatima", "paulmonaco", "sally"]
├── arman/
│   ├── manifest.json           # imageLenses: [personal, typography, marketing, arthistory, museum]
│   ├── arman.jpg
│   └── wholeimage/
│       ├── personal/wholeimage.md
│       ├── typography/wholeimage.md
│       ├── marketing/wholeimage.md
│       ├── arthistory/wholeimage.md
│       └── museum/wholeimage.md
├── fatima/
│   ├── manifest.json           # imageLenses: [history, calligraphy, crisis, memory]
│   ├── untoldstories.jpg
│   └── wholeimage/<tab>/wholeimage.md  (4 tabs)
├── paulmonaco/
│   ├── manifest.json           # imageLenses: [personal, anthropology, geology, arthistory]
│   ├── dragoonmountains.jpg
│   └── wholeimage/<tab>/wholeimage.md  (4 tabs)
└── sally/
    ├── manifest.json           # imageLenses: [personal, history, mathematics, architecture]
    ├── cathedralsaigon.jpg
    └── wholeimage/<tab>/wholeimage.md  (4 tabs)
```

Each `manifest.json` follows the pillow pattern:
```json
{
  "id": "<id>",
  "title": "<Title> — <Author>",
  "image": "<file>.jpg",
  "mask": "<file>.jpg",
  "imageLenses": ["tab1", "tab2", ...],
  "segments": []
}
```

Each `wholeimage.md` uses the existing frontmatter format (`title`, `poet`, `url`, `keyword`, `loc`) followed by the body text from the source document. `loc:` will be filled in where the source explicitly names a Library of Congress code (Arman and Paul Monaco both list LOC codes); for tabs without an explicit code I'll pick the closest LOC class (e.g. Mathematics → QA, Architecture → NA, Calligraphy → NK).

## Todo List
- [ ] 1. Extract full text of all 4 documents (2 docx, 2 pdf) into structured per-tab content using a small Python script run through `venv`
- [ ] 2. Create `galleries/ExperimentalPublishing_MalinaChen/` directory
- [ ] 3. Add the new gallery entry to `galleries.json`
- [ ] 4. Create `gallery.json` listing the 4 image ids in the order shown above
- [ ] 5. For each of the 4 students:
  - [ ] a. Copy/rename image into the item directory with a clean lowercase filename
  - [ ] b. Write `manifest.json` with `imageLenses` and an empty `segments` array
  - [ ] c. Create `wholeimage/<tab>/wholeimage.md` for each tab with frontmatter + body
- [ ] 6. Start the local server and verify in the browser that the new gallery appears in the dropdown, all 4 items render, and each item's whole-image lens button shows the correct tabs with their text
- [ ] 7. Add a review section to projectplan.md summarizing what was created

## Open Questions for the User
1. **Gallery folder name**: I propose `ExperimentalPublishing_MalinaChen` (matching the existing `ProtoGallery_PaulFishwick` style). OK?  → **YES**
2. **Gallery display name**: I propose `Experimental Publishing — Roger Malina and Tina Chen`. OK?  → **YES**
3. **Item order in the gallery**: Arman, Fatima, Paul Monaco, Sally (alphabetical by first name). OK?  → **YES**
4. **"Paul" disambiguation**: The student's name is Paul Monaco; you (Paul Fishwick) own the Proto Gallery. I'll use the id `paulmonaco` and title "… — Paul Monaco" so it's not confused with your gallery. OK?  → **YES**
5. **LOC codes for tabs without one**: Fill in best-fit codes (Mathematics → QA, Architecture → NA, Calligraphy → NK, Crisis → HT, History → D-class, Personal → leave blank or B for philosophy/personal) — OK to use my best-fit picks?  → **YES — use category names students chose; LOC codes are best-fit reference**

## Review — what was built

### Files added
- `galleries.json` updated to include the second gallery
- `galleries/ExperimentalPublishing_MalinaChen/gallery.json` — item order
- 4 `manifest.json` (one per item), 17 `*.md` content files, 4 source images (renamed to clean lowercase filenames)
- 2 `segmentation_mask.png` files (Fatima, Sally) generated via Nano Banana Pro (`gemini-3-pro-image-preview`)
- 2 mask-generation scripts: `tests/auto/create_fatima_mask.py`, `tests/auto/create_sally_mask.py`
- `tests/auto/fatima_mask.log`, `tests/auto/sally_mask.log` for traceability

### Per-item structure
| Item | Whole-image lenses | Segments | Mask |
|---|---|---|---|
| Arman / Brillo Box | Personal Perspective, Typography, Marketing, Art History, Museum Studies | — | none |
| Fatima / Untold Stories billboard | History, Crisis, Memory | Calligraphy (Urdu text region) | yes |
| Paul Monaco / Council Rocks pictograph | Personal, Anthropology, Geology, Visual Arts | — | none |
| Sally / Saigon Cathedral | Personal, History | Bell Towers (Mathematics), Facade & Arches (Architecture) | yes |

Segmentation rule: only break out a region when at least one tab is *clearly* about an identifiable region of the image; otherwise keep as whole-image. Faint pictograph marks on Paul Monaco's image were considered but skipped per user direction (mask quality would be too lossy).

### Mask color rules (verified by pixel sampling)
- Fatima: red text region — `r_gt: 200, g_lt: 50, b_lt: 50`; black background covers the rest
- Sally: red bell towers — `r_gt: 200, g_lt: 50, b_lt: 50`; green facade — `r_lt: 50, g_gt: 200, b_lt: 50`; black sky/surroundings cover the rest

### index.html change
- Added 13 lens-name overrides to `lensDisplayNames` so multi-word tab keys render as proper category names (e.g. `personalperspective` → "Personal Perspective", `typography` → "Graphic Design & Typography", `museumstudies` → "Museum Studies", `visualarts` → "Visual Arts").

### Bonus edit
- Updated `pillow/wholeimage/sally/wholeimage.md` in the Proto Gallery with the user's revised text about the pillow's colors, patterns, Morse-code observation, and African-culture readings.

### Verified
- All 23 URLs (galleries.json, gallery.json, 4 manifests, 4 images, 2 masks, 17 content files) return HTTP 200 from a local server running from this repo.
- Mask color samples confirm the colorRules will match.

### What the user needs to do
1. Open <http://localhost:8001/> in a browser (a fresh server is already running on port 8001 from this repo). Note the existing server on port 8000 is from `/Volumes/Fish/...` and was left untouched.
2. In the gallery dropdown, switch to "Experimental Publishing — Roger Malina and Tina Chen".
3. Verify all 4 items appear and clicking each opens the viewer with:
   - Whole-image lens button (top-right) showing the correct tabs with proper labels
   - For Fatima and Sally, hovering/clicking the segmented regions shows the right segment popup
4. If anything looks off, let me know which item/tab and I'll fix.

# Staging Area — public image → segments → lenses → ZIP

## Goal
A new page, `stage.html`, that anyone can run on GitHub Pages with their own OpenRouter key. A user uploads an image, segments it, chooses a lens profile, generates and refines the lens tabs, previews the result exactly as the viewer will show it, and exports a ZIP. Paul alone decides what goes into galleries: a ZIP is a *submission*, never a publish.

## Decisions so far
- Everything runs in the browser. OpenRouter allows calls from any website (CORS `*`, verified 2026-10-17); no server.
- Key: the user pastes it and it's stored only in their browser; optional "Sign in with OpenRouter" (PKCE).
- Image source: upload only (drop / paste / choose), as in the Segment app.
- Segmentation: reuse `~/code/graphics/segment`. Same interface; `server.py` logic rewritten in JavaScript.
- Lens profiles (menu): **User**, **Science/Art**, **LAMESH** (Language, Art, Math, Engineering, Science, History).
  - Science/Art: page asks "Which science?" and "Which art?"; each may be left as "AI picks best fit per segment".
  - User: user names the lenses and may write the tab text themselves; AI drafting is optional.
  - **Personal**: just a user-named lens the user writes themselves (see Answered).
- In every profile (User, Science/Art, LA MESH) each lens is either drafted by AI or written by the student; any tab can be edited, and blank tabs offer "Draft with AI". submission.json records who wrote each tab.
- Whole-image lenses: yes, same profile, written to `wholeimage/<lens>/wholeimage.md` + `imageLenses` in manifest.
- Tab images: a real image from the tab's Wikipedia/Commons page; a "Generate image" button per tab as an alternative.
- Reading level defaults to 9th–10th grade (per lamesh.md).

## Flow
1. **Key**: paste key or sign in; shows running cost of the session's calls.
2. **Segment**: drop zone, "also include" list, model menu, SEGMENT, hover check, overlay slider, segments table. Added: rename / delete segments, re-segment.
3. **Profile**: choose User / Science/Art / LAMESH; answer that profile's questions; tick Personal if wanted.
4. **Generate tabs**: for each segment and the whole image, a text model returns JSON per lens: `title, url, body, keyword, loc`. URLs and images are checked against the Wikipedia API.
5. **Preview & refine** (loop until Export): hover shows label; click opens the tabbed popup (shared viewer code). Per tab: edit fields, regenerate with an instruction, swap/generate image. Per segment: add/remove lens.
6. **Export ZIP**:
   ```
   <id>/
     manifest.json            (segments with colorRule + lenses, imageLenses, credit)
     <image>  segmentation_mask.png
     <segment>/<lens>/<segment>.md  (+ lens image)
     wholeimage/<lens>/wholeimage.md (+ lens image)
     submission.json          (contributor, credit, suggested gallery or new one, profile, models, date)
   ```
   Work in progress is kept in the browser (IndexedDB) so a reload doesn't lose paid-for results.

## Code plan
- `js/viewer-core.js` — hover lookup + tabbed popup extracted from `index.html`; used by both pages.
- `js/segment.js` — rewrite of `server.py` logic: prompt, palette, snap to palette, 5×5 mode filter, resize, canonical/non-overlapping colorRules, label follow-up call.
- `js/openrouter.js` — key handling, chat call with retries (429/502/503), image extraction, cost tracking.
- `js/lenses.js` — profile definitions, generation prompts, Wikipedia checks.
- `stage.html` — the page; JSZip from cdnjs for export.
- Default models: segmentation `google/gemini-3-pro-image` (as in Segment); text `anthropic/claude-sonnet-5.5`; both selectable.
- Later: `import_submission.py` for Paul (check, place into gallery, update gallery.json); GitHub PR submission.

## Answered (2026-10-17)
- Layout: start from the `~/code/graphics/segment` interface.
- User profile: user names lenses and can write the text; AI draft is optional per lens.
- Personal: not a special type. The user simply adds a lens named "Personal" (or anything) and writes it.
- stage.html is linked from the gallery page.
- No key is ever bundled or read from ~/.env: every user clicks "Enter OpenRouter key" before any paid step.

- Curator review (Paul, 2026-10-17): students email Paul their ZIP. index.html gets "Review a submission (ZIP)": opens it in the real viewer (in-browser, nothing uploaded) with a summary panel (contributor, suggested gallery, AI vs. user-written tabs, problems). stage.html can open a ZIP to edit it. Accepting = `import_submission.py <zip> --gallery <id>` (or new gallery name/author), which validates, copies, updates gallery.json / galleries.json, refuses overwrite without --replace; Paul commits.

## TODO
- [x] Extract viewer hover/popup into `js/viewer-core.js`; verify index.html unchanged in behavior
- [x] Rewrite Segment logic in JS; verify masks match Python output on the same image
- [x] OpenRouter client + key UI
- [x] Segment step UI (from Segment app) + rename/delete
- [x] Profile menu + questions + Personal
- [x] Tab generation + Wikipedia checks
- [x] Preview & refine loop
- [x] IndexedDB persistence
- [x] ZIP export; verify by unpacking into a scratch gallery and viewing in index.html
- [x] Stage: open a submission ZIP for editing
- [x] index.html: Review a submission (ZIP) with summary panel
- [x] import_submission.py
- [x] Review

## Review — what was built (2026-10-17)
- `css/viewer-core.css`, `js/viewer-core.js`: popup, lightbox, markdown parsing, colorRule lookup moved out of index.html unchanged; tabs can carry a display name (`tab:` front-matter field).
- `js/openrouter.js`: visitor-entered key (optional "remember"), OpenRouter sign-in (PKCE), retries, session cost.
- `js/segment.js`: port of Segment's server.py. Verified pixel-identical to the current Python output on two saved raw maps (Pillow's NEAREST resize steps by repeated addition; copied exactly).
- `js/lenses.js`: profiles, tab prompts (JSON schema), Wikipedia link + Commons-only lead image, per-tab revise, image generation.
- `js/submission.js`: ZIP writer/reader and checks shared by stage and review.
- `stage.html` + `js/stage.js`: steps 1–4, IndexedDB resume, Open ZIP.
- `index.html`: "Stage your own image" and "Review a submission (ZIP)" links; viewer can load from a ZIP; `js/review.js` summary panel + import command.
- `import_submission.py`: --check, existing or new gallery, --id, --replace.
- Tested headless (Playwright) with OpenRouter mocked: segment → LA MESH with Art self-written → generate → preview popup → export → resume → reopen ZIP → review in index.html; gallery viewer regression; import into a scratch repo. Not yet tested against live OpenRouter models.
