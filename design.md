# Portfolio Design Audit & Source of Truth (`design.md`)

> **Status:** Audit Complete — Awaiting User Review & Approval  
> **Scope:** Inspection-only design and interaction audit. No implementation has begun.  
> **Rule:** Every design decision in this document is traced directly to one of the three reference websites or explicitly marked as an unresolved decision awaiting approval.

---

## 1. Project Design Objective

Build a personal developer portfolio by faithfully recreating and combining specific structural, visual, and interactive elements from three reference websites:

1. **Tania Rascia** — https://www.taniarascia.com/ (**Structural Foundation**)
2. **109ichiki** — https://109ichiki.com/ (**Visual Identity, Hero Masking Effect & Works Showcase**)
3. **Jhey Tompkins** — https://www.jhey.dev/ (**Micro-Interactions & Tactile Animations**)

### Role of Each Reference

| Reference | Primary Role | What We Take From It |
|---|---|---|
| **Tania Rascia** | Information architecture & page structure | Persistent desktop left sidebar + mobile top navbar, homepage section cadence (Hero/Intro → Timeline → Latest Content → Shelves → Series → Projects/Works → Footer), typography scale & readability, structured content lists. |
| **109ichiki** | Visual system, hero masking & works showcase | Viewport-framed dark/light aesthetic, draggable OS-window hero masking portals (`meme.webp` technique), sticky full-viewport CRT/VHS scroll-driven works showcase + ruled Pickup Works rows, barcode/monospace graphic accents, wavy wireframe canvas grids, cascading dialog windows in Profile. |
| **Jhey Tompkins** | Delightful micro-interactions & tactile polish | Handwritten SVG signature draw-on animation, mechanical crane/claw dot placement on the letter `i`, perched birds on a link that flee on hover and return after a delay, interactive pluckable background grid, holographic peelable sticker / refractive gem decorative elements, scramble-decode text reveals, inverted-block prose link hovers. |

---

## 2. Existing Project Technical Setup

Directly observed in `c:\Users\Akshat\Code\portfolio-v2`:

- **Project state:** Empty/uninitialized workspace.
- **Framework / Libraries:** None installed (no `package.json`, no `node_modules`, no build config).
- **Version control:** None initialized (no `.git` directory).
- **Existing pages / components / styles:** None.
- **Existing design documentation:** None prior to this `design.md`.
- **Existing contents:** Only the `references/` directory containing 5 visual assets.

---

## 3. Reference Asset Inventory (`references/`)

| Filename | Format & Size | Dimensions / Duration | Reference Site | Section / Element Demonstrated | Observed Visual & Interactive Details |
|---|---|---|---|---|---|
| `ichika_1.png` | PNG (`1.36 MB`) | `2559 × 1599` | **109ichiki** | Homepage Hero (Dark Mode) | Full-viewport rounded outer frame; top-right theme dots (`● ○`) + `1:09` clock; top-center bordered pill nav (`HOME`, `WORKS`, `PROFILE`, `CONTACT`) with active white pill; top-right `Twitter ↗` / `Instagram ↗` pills; background warped wireframe grid; full-body character (`meme-chan`) on right; 4 overlapping thin-bordered OS-style `meme.webp` windows revealing zoomed/synced crops of the character; 3D matte-white `mochiusa` figures floating in foreground; bottom-left `1:09 / illustration / portfolio` + barcode. |
| `ichika_vid.mp4` | MP4 (`389.4 MB`) | `2560 × 1600`, `01:39` | **109ichiki** | Full Site Walkthrough (Hero, Event, Works Showcase, Pickup Works, Profile, Footer, `/works/`, `/profile/`) | *Inspection method note:* Exceeded the direct `100 MB` file-read limit, so **22 keyframes** (`0s`–`95s`) were extracted via Windows WPF `MediaPlayer` and visually inspected, then cross-verified against the live site's CSS/JS. Captures: floating 3D `mochiusa` & `meme.webp` masking windows (`0s–12s`); `EVENT_` ruled rows with wavy grid + stickers (`16s–20s`); `WORKS_` intro + sticky full-bleed CRT/VHS scanline/glitch showcase cycling `category_01`–`04` with live timecode and cascading bottom-right dialog cards (`20s–45s`); `(PICKUP WORKS)` horizontal ruled list (`50s`, `85s–90s`); `PROFILE_` cascading `profile.jpg` window trails (`55s–60s`); 3D rotating `meme-chan` + iridescent holographic ribbon footer (`65s`, `85s–90s`); `/works/` 3-column archive (`70s`); `/profile/` page (`75s–80s`); hero revisited with rearranged/closed dialog window composition (`95s`). |
| `Jhey.mp4` | MP4 (`3.72 MB`) | `00:29` | **Jhey Tompkins** | Homepage Full Interaction Walkthrough (Dark Mode) | *Inspected directly frame-by-frame.* Captures: initial load (`00:00–00:04`) with holographic bear sticker above `Jhey Tompkins`; mechanical crane/claw lowering from top of viewport (`00:03–00:07`) to drop the dot onto the `i` in `Tompkins` with bounce and retracting upward; handwritten signature + bear-face SVG drawing in (`00:00–00:02`, `00:05–00:07`); `LATEST` links and footer presence telemetry scrambling/decoding into place (`00:03–00:05`); blue birds perched around `FOLLOW` flying away on hover and returning (`00:12–00:20`); floating 3D refractive gem beside `LATEST`; red hover accent on `LATEST` items (`00:18`, `00:23`); subtle diagonal-fading background grid. |
| `tania_1.png` | PNG (`380 KB`) | `2550 × 1594` | **Tania Rascia** | Homepage (Dark Mode, Pink Accent) | Fixed `260px` left sidebar (`tania.dev` floppy icon, pink color-picker dot, sun/moon theme toggle, 2-line bio, icon+label nav `Blog`, `Shelves`, `Projects`, `About me`, bottom social icons + `Resume \| Topics \| Source`); main column with `Hey, I'm Tania!`, tagline, `A brief timeline` (monospace date spans `1998–2006`..`2021–now` + underlined accented links), `Also:` line, right-side mascot over circular pink backdrop + pointed speech bubble, horizontal rule, and `Latest` section (`All Posts` button, icon + title + date rows, right-aligned `#tag` pills). |
| `tania_2.png` | PNG (`342 KB`) | `2557 × 1599` | **Tania Rascia** | `/shelves/` Curated Collections Page (Dark Mode) | Persistent left sidebar with `Shelves` active highlight; main content with icon + `Shelves` heading, subtitle, and grouped sections (`Fundamentals`, `Deep dives`, `Reinventing the wheel`), each containing an `h2`, intro paragraph, and 2-column icon + title link list separated by subtle horizontal borders. |

---

## 4. Tania Rascia: Structural Reference Audit

**Source:** Live DOM/CSS of `https://www.taniarascia.com/` + `tania_1.png` & `tania_2.png`.

### Directly Observed Structure & Layout

- **Overall Page Layout:**
  - Desktop uses a 2-column CSS Grid (`.layout`): `grid-template-columns: var(--sidebar-width) 1fr` where `--sidebar-width: 260px`, centered with `max-width: calc(var(--content-width) + var(--sidebar-width) + var(--post-sidebar-width) + 6rem)` (`--content-width: 760px`, `--post-sidebar-width: 260px`).
  - Main content container (`.main-content.page`) expands to `max-width: calc(var(--content-width) + var(--post-sidebar-width))` (`1020px`), while single-article reading width is `760px`.
  - Supports light (warm beige `--beige-0: #f8f4e6`..`#c6ba93`) and dark (charcoal `--gray-11: #16161a`, `--gray-10: #1d1d22`, `--gray-8: #28282e`) themes plus selectable accent colors (e.g., `--theme-pink`, `--theme-yellow`).
- **Header & Navigation:**
  - **Desktop:** Sticky full-height (`100vh`) left `<aside class="sidebar">` (`260px` wide, `1px solid var(--color-border)` right border). Contains 4 vertically stacked sections separated by `1px` borders:
    1. Site title (`tania.dev` + `16px` floppy logo) + Color accent picker circle + Light/Dark theme toggle button (with hover tooltips).
    2. Short 2-line bio with link to `/me/`.
    3. Primary nav links (`Blog`, `Shelves`, `Projects`, `About me`), each with a `16px` pixel/icon graphic and rounded hover/active pill background.
    4. Bottom-pinned utility block (`.sidebar-bottom`): 5 social/feed icons (`Email signup`, `GitHub`, `Bluesky`, `RSS`, `New Moon`) and sub-links (`Resume | Topics | Source`).
  - **Mobile / Tablet:** Left sidebar hides (`display: none`); fixed top `<header class="navbar">` (`height: 60px`, `z-index: 10`) appears with site title, hamburger menu toggle, theme/color toggles, and social icon.
- **Homepage Section Order (Top to Bottom):**
  1. **Hero / Introduction (`.hero.hero-index`):** 2-column `.hero-wrapper`. Left side: `<h1>` greeting, `.hero-tagline`, `<h2>` `"A brief timeline"`, `<ul class="hero-eras">` (4 chronological rows with fixed `90px` monospace `.era-dates` on the left and narrative + underlined links on the right), and an `"Also:"` personal interests paragraph. Right side: `.hero-image-container` (illustration over a `200px` accent circle + pointed `.hero-bubble` card below).
  2. **Latest Content (`.section-index`):** Heading row (`<h2>Latest</h2>` + `.button.secondary.small` `"All Posts"`). Vertical list (`.posts`) of 4 `.post.detailed` rows, each with: left thumbnail icon, center title + `<time>` date, and right-aligned `.post-tags` pill chips (`#javascript`, `#react`, etc.).
  3. **Shelves (`.section-index`):** Heading row (`<h2>Shelves</h2>` + `"All Shelves"` button) + 1-line `.description`. 2-column grid (`.cards.cards-half`) of 4 `.card.card-highlight.card-shelf` cards (`Fundamentals`, `Deep dives`, `Reinventing the wheel`, `Off the clock`), each showing title, numeric count `.chip`, and multi-line description. (Dedicated `/shelves/` page expands each shelf into a 2-column icon+title link list.)
  4. **Series (`.section-index`):** Heading (`<h2>Series</h2>`) + 1-line `.description`. Vertical `.posts` list of 5 multi-part series rows, each with icon thumbnail, title, and `.post-description`.
  5. **Projects (`<section>`):** Heading row (icon + `<h2>Projects</h2>` + `"All Projects"` button) + `.description`. 3-column desktop / 2-column tablet / 1-column mobile grid (`.cards`) of 6 `.card` items, each with `<time>` year, project link, short description, and `.card-links` (`Article`, `Demo`, `Source`). *(Note: Per user directive, our portfolio replaces this conventional 3-column grid with 109ichiki's works showcase technique while preserving Tania's section position.)*
  6. **Footer (`.footer`):** Top `1px` border, aligned with main content column (`padding-left` offset). Contains 3 rows: `.footer-menu` icon+text links (`Email signup`, `RSS feed`, `Bluesky`, `Buy me a coffee`), `.footer-menu-buttons` stack badges (`Gatsby`, `GitHub`, `Netlify`), and `.footer-made-by` credit line with heart icon.
- **Typography & Spacing:**
  - Body: `-apple-system, BlinkMacSystemFont, "Google Sans Flex Variable", Helvetica, Arial, sans-serif`, `16px`, `line-height: 1.55`.
  - Headings: `"Outfit Variable", -apple-system, BlinkMacSystemFont, "DM Sans", ...`; desktop scale `--h1: 2.4rem`, `--h2: 1.9rem`, `--h3: 1.6rem`, `--h4: 1.25rem` (mobile: `2rem`, `1.6rem`, `1.4rem`, `1.15rem`).
  - Monospace: `"Google Sans Code Variable", Menlo, monospace` (used for site name, era dates, sidebar headings, bubble link).
  - Card borders: `2px solid var(--color-border-card)`, `border-radius: 8px`, subtle layered drop shadow, `0.15s ease` transitions.

---

## 5. 109ichiki: Visual & Showcase Reference Audit

**Source:** Live DOM/CSS/JS (`/_astro/style.COBHKi4A.css`, `/_astro/hoisted.DLZDcrRD.js`) of `https://109ichiki.com/` + `ichika_1.png` + 22 keyframes from `ichika_vid.mp4`.

### A. Hero Masking Effect (Directly Observed)

#### Visual Layers (Back to Front)
1. **Viewport Canvas Background:** Solid theme background (`#101016` dark / `#f3f3ff` light).
2. **Layer 1 — Wavy Wireframe Grid (`._kvGrid_1fs6u_86`, `80vw × 62svh`, centered):** `<canvas>` (`data-js="grid"`) rendering a continuously undulating perspective wireframe grid with an outline border.
3. **Layer 2 — Base Artwork (`._kvImages_1fs6u_99`, `z-index: 1`, `pointer-events: none`):** Contains `_kvMainImage` (`50vw × 89svh`, right-aligned full-body `meme_full.webp`) and `_kvPcImage` (desktop-only zoomed `scale(1.4)` layer used during the opening wipe).
4. **Layer 3 — Masking Dialog Portals (`._kvDialogWrapper_1fs6u_197`, `z-index: 2`):** Four overlapping retro OS-style dialog windows (`[data-js="index-kv-dialog"]`, title `"meme.webp"`, `1px solid var(--color-border)`, `3px` border radius, header bar with `×` close button):
   - Window 1: `16.25rem × 15rem`, `top: 24svh; right: 8vw; z-index: 1`
   - Window 2: `17.5rem × 16.25rem`, `top: 34svh; right: 21vw; z-index: 2`
   - Window 3 (desktop only): `36vw × 62svh`, `bottom: 15svh; left: 15vw; z-index: 3`
   - Window 4 (desktop only): `15rem × 17.5rem`, `bottom: 23svh; left: 6vw; z-index: 4`
5. **Layer 4 — Bottom-Left Hero Title & Barcode (`._kvContent_1fs6u_30`):** Stacked monospace `<h1>` (`1:09 / illustration / portfolio`) + `Libre Barcode 128` barcode graphic.
6. **Layer 5 — Foreground 3D WebGL Mascots (`._kvGL_1fs6u_308`, `position: fixed`, `z-index: 10001`, `pointer-events: none`):** Three.js canvas (`gl-index-kv`, class `h3`) dropping/floating matte-white 3D `mochiusa` figures with a subtle drop shadow (`filter: drop-shadow(1rem 1rem 2px rgba(0,0,0,.1))`).
7. **Layer 6 — Fixed Outer Viewport Frame (`._frame_yk7yd_1`, `z-index: 2000`):** Thin rounded-rectangle SVG border inset by `--padding-outside` (`20px` desktop / `15px` mobile), with top-right theme switcher dots and `1:09` clock.

#### Exact Masking Mechanism (Verified from CSS + JS `class xM` & `class Od`)
- **Shape:** Rectangular OS dialog window bodies (`._body_3fli2_117`), **not** circular or SVG-clipped masks.
- **How the mask works:**
  - Each window's body container has `overflow: hidden; contain: paint; background-color: var(--color-bg);`.
  - Inside that clipped body sits `._kvDialogBody_1fs6u_282`, which is explicitly sized to the **full viewport (`100vw × 100svh`)** and holds a duplicate of the artwork (`_kvDialogImage` + desktop zoomed portrait crop `_kvDialogImagePc` at `78vw × 100svh`, `bottom: -30svh; left: 0`).
  - The JS class `xM` reads each window's bounding box (`currentX`, `currentY`), applies a small per-window random offset (`randomShiftX/Y = (Math.random() - 0.5) * 20`, i.e., `±10px`), and continuously transforms `_kvDialogBody` by the **exact inverse** of the window's position:
    ```
    translate3d(-currentX + randomShiftX - paddingOutside, -currentY + randomShiftY - paddingOutside - headerHeight, 0)
    ```
  - **Result:** Each OS window functions as a **viewport-locked masking portal/lens**. The content inside stays aligned to a fixed full-viewport composition (with slight `±10px` glitchy offset per window), so overlapping windows reveal continuous pieces of a larger hidden zoomed artwork (`_kvDialogImagePc`) and base artwork (`_kvDialogImage`).
- **Initial Load Animation (GSAP timeline on `my:openingend`):**
  1. `_kvPcImage` and `_kvMainImage` wipe in via CSS custom property `--_progress: 0 → 1` controlling `clip-path: inset(...)` (`0.6s`, `power4.out`, staggered `0.2s`), paired with `_kvMainImage` rising `y: 20 → 0` (`1s`, `power4.out`).
  2. Visible dialog windows pop in sequentially from `opacity: 0, scale: 0.8` (`duration: 0.12s`, `stagger: 0.15s`, `ease: "power4.out"`).
  3. 3D `mochiusa` mascots trigger `openingMochiusa()` `0.1s` later.
- **User Interaction:**
  - **Drag:** Grabbing any window's titlebar (`data-js="dialog-box-header"`, `cursor: grab` → `grabbing`) drags the window freely via class `Od`, updating `xM.currentX`/`currentY` on every frame so the masked artwork pans smoothly inside the window like a magnifying/reveal frame, and brings the active window to the front (`zIndexId: "kv"`).
  - **Close (`×`) button:** Clicking `×` on hero dialogs does **not** remove them; it sets `data-blink="true"` for `500ms` (`0.1s step-end infinite` rapid blink) as a playful error-dialog reaction.
  - **Scroll / Pointer:** The masks do **not** track passive pointer movement or scrub on scroll; they respond exclusively to direct window dragging and viewport resize.
- **Responsive Behavior:** Below desktop breakpoint, Windows 3 & 4 and `_kvDialogImagePc` are hidden (`display: none`), leaving 2 compact overlapping windows (`min(53.33vw, 18.75rem)` wide).

---

### B. Works Showcase (Directly Observed)

109ichiki uses a **two-stage homepage Works presentation** (not a conventional 3-column grid):

#### Stage 1: Sticky Full-Viewport CRT/VHS Category Showcase (`[data-js="index-service"]`)
- **Scroll Architecture:** A `position: sticky` full-viewport frame (`._serviceSticky_1fs6u_486`, `height: calc(100svh - var(--padding-outside) * 2)`, `top: var(--padding-outside)`) sits over a tall vertical scroll track (`._serviceScroll`) containing 4 scroll-trigger spacers (`[data-js="index-service-scroll-item"]`), one per category.
- **Background Wireframe Frame (`._serviceFrame_1fs6u_799`):** A full-bleed dashed diagonal `X` (`dashed-cross`) sits behind the display before it activates (`opacity: 0 → 1` over `0.4s ease-out` when `[data-service="true"]`).
- **Full-Bleed WebGL CRT/VHS Display (`[data-js="gl-index-service"]`, class `f3`):**
  - Renders full-bleed artwork textures per category onto WebGL planes (`aspect`-preserved cover/contain via FBO) with a custom fragment shader (`d3`) adding dark CRT scanlines, grain, green horizontal tracking line, and chromatic aberration.
  - **Auto-cycling within a category:** Images in the active category cycle automatically every **`750ms`** (`setInterval` → `handleInterval()`).
  - **Scroll-driven transitions between categories:** GSAP `ScrollTrigger` (`start: "top bottom"`, `end: "bottom bottom"`, `scrub: true`) feeds `uScrollProgress` continuously to the shader and triggers `updateService(index)` when crossing each category boundary:
    - Tweens `planeOffset` to the new category index over **`0.3s`** (`power3.inOut`).
    - Spikes shader uniform `uShake` from `0.002` up to **`0.252`** at the midpoint (`progress = 0.5`) and back down, creating the heavy horizontal VHS glitch-tear transition seen in `ichika_vid.mp4` (`frame_040s`–`045s`).
  - **Click-to-Pause Interaction:** Clicking the canvas toggles `data-status="playing" | "paused"`, pausing both the `750ms` artwork cycling and the live `HH.MM.SS.cs` timecode, and flashing a center play/pause icon (`0.1s` fade in, `0.4s` hold, `1s` fade out).
- **Overlapping HUD & Cascading Dialog Cards:**
  - **Top-Left HUD (`._serviceLeftTop`):** `● WORKS CATEGORY` + numbered list (`1: illustration`, `2: mv-illustration`, `3: event`, `4: goods`). Active item displays a blinking left-pointing arrow (`1s step-end infinite`). Entire HUD text layer (`._serviceText`) disables font smoothing and applies an RGB chromatic aberration filter: `drop-shadow(-1px 0px #ff0000) drop-shadow(1px 0px #00ffff) opacity(0.8)`.
  - **Bottom-Left HUD:** Blinking `PLAY` / `PAUSE` label (`1s step-end infinite`) above a live ticking timecode (`00.00.00.00`).
  - **Bottom-Right Cascading Category Dialogs (`._serviceDialog`, `width: 25rem` desktop / `75vw` mobile):** As the user scrolls from category 1 to 4, previous category dialogs **remain stacked behind** the active one (`ne <= V` stay `data-visible="true"`), offset diagonally by `calc(var(--padding-outside) + 0.625rem * var(--_index))` from bottom and right! Each card scales in from `scale(0.8), opacity: 0` over **`0.12s`** (`cubic-bezier(0.22, 1, 0.36, 1)`), displaying OS titlebar (`category_01`..`04`), category title, description, inverted pill CTA link (`→`), and bottom-right barcode.

#### Stage 2: Pickup Works Ruled List (`(pickup works)`)
- Directly below the sticky showcase, 6 featured works are presented as full-width horizontal rows (`._pickupCard_o1ekn_15`, height `6.09375rem` desktop / `5rem` mobile, `border-top: 1px solid var(--color-border)`, last row has `border-bottom`).
- Arranged on the 12-column grid (6 columns on mobile): work title on left, rounded pill tags in center, right-aligned cropped thumbnail (`<picture>`), and an arrow badge (`._icon_o1ekn_26`) whose background/foreground colors invert instantaneously on row hover (`--duration-hover-material: 0s`).
- Concludes with a centered pill CTA (`すべて見る →`) linking to `/works/`.

---

### C. Remaining Visual Identity (Directly Observed)

- **Color Palette & Relationships:**
  - Light theme (default `:root`): Background `#f3f3ff` (`--color-white-2`), Text `#101016` (`--color-black-2`), Borders `#565656` (`--color-black-3`).
  - Dark theme (`[data-theme="dark"]`): Background `#101016`, Text `#ffffff`, Borders `#a4a4a4` (`--color-white-3`).
  - Strict high-contrast monochrome UI chrome so vibrant neon/pastel artwork pops against the frame; chromatic red (`#ff0000`) and cyan (`#00ffff`) used solely for CRT HUD aberration.
- **Typography:**
  - Primary Latin/UI: `"IBM Plex Mono"` (monospace everywhere for UI chrome, navigation, labels, headings).
  - Japanese body: `"Hiragino Kaku Gothic ProN", "Hiragino Sans"`.
  - Decorative barcodes: `"Libre Barcode 128"` (`3rem` desktop / `2.25rem` mobile, `aria-hidden="true"`).
  - Fluid root size: `clamp(14px, 1.1111vw, 16px)`. Scale: `--font-size-h2: 3.5625rem`, `--font-size-large: 2.1375rem`, `--font-size-h3: 1.1875rem`, `--font-size-base-en: 0.9375rem`, `--font-size-small: 0.75rem`.
- **Graphic Elements, Borders & Chrome:**
  - `1px solid var(--color-border)` structural hairlines dividing sections, rows, and dialog windows.
  - Dashed diagonal crosses (`dashed-cross`) filling structural negative space.
  - Canvas wavy perspective grids (`data-js="grid"`) behind Hero, Event, Profile, and Footer.
  - Die-cut floating character stickers (`data-js="sticker"`) overlapping grid regions.
  - Pill navigation bar (`._menu_10du9_25`) with animated active indicator (`header-menu-current`) and pill social buttons with diagonal arrow (`↗`).
- **Profile Presentation (`._profile_1fs6u_836`):**
  - 2-column desktop split divided by a `1px` vertical line: left side has `PROFILE_` heading + barcode + bio + `"もっと見る →"` pill; right side has a wavy canvas grid + floating stickers + **two cascading trails of 6 overlapping `profile.jpg` OS dialog windows** (`--index: 0..5`, offset `1.25rem` top / `1.875rem` right per card) evoking classic Windows drag-trail errors.
- **Footer:** Wavy grid + 3D rotating `meme-chan` canvas (`footer-gl-meme`) + full-width iridescent holographic WebGL ribbon (`footer-gl-holo`, `6.09375rem` height) + credits, barcode, social links, copyright.

---

## 6. Jhey Tompkins: Interaction Reference Audit

**Source:** Live DOM/CSS/JS (`/_astro/index.EAykSgx_.css`, `mount.Cg7qMrcO.js`, `mount.OT8Tw7t0.js`, `mount.CfgDyHjX.js`, `refractive-gem.BbGkksXj.js`, `scramble.BYd-10cx.js`) of `https://www.jhey.dev/` + `Jhey.mp4`.

### 1. Handwritten Name / Signature Animation (`.sig`)
- **Initial State:** Inline SVG (`viewBox="0 0 271 209"`, rotated `12deg`, `pathLength="1"` on every `<path>`) positioned beside the action links (`sm:absolute sm:top-0 sm:left-0`, `w-28` mobile / `w-32` desktop). All strokes hidden via `stroke-dasharray: 1.025; stroke-dashoffset: 1.025`; `.eye` and `.nose` fills transparent (`#0000`).
- **Trigger:** Automatic on page load (CSS animation, no JS needed).
- **Animation Sequence & Movement:**
  1. Main cursive signature stroke draws smoothly (`stroke-dashoffset: 1.025 → 0`) starting at `--base-delay: 0.75s` for `--path-speed: 0.831875s`.
  2. Decorative bear ears, eyes, and nose paths draw sequentially using exact cumulative `--path-delay` values (`0.831875s`, `0.86375s`, `0.899375s`, etc., durations `0.016s–0.036s`).
  3. After `--base-delay + --natty-delay` (`0.75s + 0.973125s = 1.723s`), `.eye` and `.nose` fill to `currentColor` (`@keyframes fill`, `0.5s forwards`).
  4. `.eye` enters a subtle looping double-blink (`@keyframes blink`, `6s infinite`: `scaleY(1) → 0.1` at `47%` and `49%`).
- **Duration & Easing:** Total draw sequence `~1.0s` after `0.75s` delay; `ease-in forwards` per stroke.
- **Final State & Reset:** Remains drawn with continuous subtle eye blink every `6s`. No reset unless reloaded.
- **Mobile Considerations:** Stacks cleanly below the action links (`mt-4`, `w-28`) instead of overlapping beside them; respects `prefers-reduced-motion`.

### 2. Animated Mechanical Dot Associated with Letter `i` (`[data-namemark]`)
- **Initial State:** The `<h1>` wordmark (`Jhey Tompkins`) is an inline SVG (`--cap: 1490px`). The dot (tittle) of `i` and a two-prong mechanical crane claw + vertical cable are grouped (`<g>`) and parked high above the viewport (`translateY(-24 * var(--cap))`).
- **Trigger:** Automatic on page load (`motion-safe:animate-*`).
- **Animation Sequence & Movement (all 4 keyframes share `3.4s` total duration, `1.6s` delay, `linear` outer timeline with per-keyframe easing):**
  1. **Descent (`@keyframes ride`, `0%–30%` = `~1.02s`):** Claw holding the dot descends together from `-24 * var(--cap)` to the release height `-0.55 * var(--cap)` with `cubic-bezier(0.3, 0.85, 0.2, 1)`.
  2. **Claw Release (`@keyframes claw`, `37%–43%` = `~0.20s`):** Left/right prongs rotate from `0deg` to `±25deg` with `1.12×` overshoot (`±28deg` at `40%`, `cubic-bezier(0.2, 0, 0.1, 1)` → `cubic-bezier(0.4, 0, 0.3, 1)`).
  3. **Dot Drop & Bounce (`@keyframes dot-place`, `42%–64%` = `~0.75s`):** Dot falls to `0.55 * var(--cap)` with two crisp elastic bounces (`+0.045` impact at `51%`, `-0.05` rebound at `56%`, `+0.013` micro-bounce at `60%`, resting at `64%`).
  4. **Arm Retraction (`@keyframes arm`, `48%–100%` = `~1.77s`):** Crane arm and cable accelerate upward (`cubic-bezier(0.75, 0, 1, 1)`) back out of the viewport (`(0.55 - 24) * var(--cap)`).
- **Final State & Reset:** Dot sits permanently on the `i`; crane is parked off-screen above. One-shot on load (no reset).
- **Mobile Considerations:** Scales proportionally with the fluid SVG wordmark (`clamp(4rem, 3.83rem + 0.726vw, 4.511rem)`). Under `prefers-reduced-motion: reduce`, animations do not run and the parked final transforms leave the dot already in place with the crane off-screen.

### 3. Birds Around the `FOLLOW` Link (`[data-flock]` / `Perch`)
- **Initial State:** Multiple small articulated SVG birds (`--color-bird: #4493d0`, `viewBox="-12 -18 24 24"`) are dynamically cloned from `<template>` into `[data-flock-layer]` and fly in to perch directly along the top of the `FOLLOW` text node. Each bird receives randomized traits (`nervous`, `speed`, `scale: 0.94–1.06`, `plump`, `voice`, slight OKLCH lightness `--dl: ±0.015` & hue `--dh: ±2deg`).
- **Idle Animation:** Driven by 10 damped springs (`squash`, `sit`, `sink`, `pitch`, `wing`, `open`, `tail`, `legs`, `face`, `head`) integrated in fixed substeps (`~480Hz`). Perched birds periodically pick weighted idle actions: `hunker`, `tilt`, `turn`, `bob`, `twitch`, `flick`, `shuffle`, `wander`, `look` (tracks nearby pointer/neighbor), `greet`, `perk`, and `sing` (optional Web Audio synthesized bird calls: `cheep`, `chip`, `tsee`, `trill`, `chirrup`, `song`).

### 4. Birds Flying Away on Hover & Returning After a Delay
- **Initial State:** Perched along `FOLLOW`, running idle behaviors.
- **Trigger:**
  - Desktop: `pointermove` within proximity (`distance < radius * 4`, where `radius = 1.5em`) or keyboard `:focus-visible` on the `FOLLOW` link.
  - Touch: `pointerdown` near the link.
- **Animation Sequence & Movement:** Approaching pointer first triggers wary/alert posture (`alert`: `squash: 1.04`, `sink: -0.7`, `pitch: -4`, `head: -6`); getting closer spooks the birds, which crouch briefly, emit an optional `alarm` chirp, and launch off along smooth cubic Hermite spline flight curves (`at()`) with flapping wings (`flap: 7–9Hz`) and directional banking until exiting off-frame (`state: "away"`, `opacity → 0`).
- **Duration & Easing:** Procedural physics/Hermite spline timing per bird (`speed: 0.88–1.14×`), not fixed CSS keyframes.
- **Final State:** Birds are away/hidden while pointer remains near or focused.
- **Reset / Return Behavior:** When pointer moves outside `radius * 4`, leaves the document (`pointerleave`), or `blur` fires (and on touch, **`900ms`** after `pointerup`/`pointercancel`), `flock.withdraw()` clears the disturbance and birds fly back in one by one to re-land on `FOLLOW` (with optional landing `cheep`/`chip`).
- **Mobile Considerations:** Uses `pointerdown` + `900ms` post-release cooldown instead of hover; completely disabled under `prefers-reduced-motion: reduce`; pauses automatically via `IntersectionObserver` (`rootMargin: 160px`) or when tab is hidden (`visibilitychange`).

### 5. Hanging / Floating Decorative Objects
- **Holographic Peelable Bear Sticker (`[data-holo-sticker]`, `mount.CfgDyHjX.js`):**
  - **Initial State:** Anchored above `header h1 svg` (`Jhey Tompkins`, seen in `Jhey.mp4`). Randomly selects 1 of 13 bear illustrations (or night bear `016` between `22:00` and `06:00`), rendered on a full-viewport WebGL2 canvas (`z-index: 20`, lifts to `z-index: 40` when grabbed).
  - **Trigger & Movement:** Hover/pointer movement shifts the holographic foil glint (`uHolo`, `uLightDir`); dragging peels the sticker off the page using a real-time 3D cylindrical bend shader (`bendSheet`), leaving up to 12 remembered physical creases (`uCrease[12]`) and optional peel audio; can be repositioned/re-stuck anywhere on the viewport.
  - **Mobile / Fallback:** Requires `WebGL2RenderingContext`; removes itself cleanly if unsupported.
- **Movable 3D Refractive Gem (`<refractive-gem>`, `refractive-gem.BbGkksXj.js`):**
  - **Initial State:** `50px`-wide faceted crystal positioned near `LATEST` (`top: -62px; right: 52px` mobile / `top: 58px; left: 63.8%` desktop), enters with `@keyframes reveal` (`0.5s cubic-bezier(0.2, 0.7, 0.3, 1)`, `scale: 0.88 → 1`, `translateY: 0.6rem → 0`, `blur: 4px → 0`).
  - **Trigger & Movement:** Slowly idles (`idle="11"`), raytraces 5 internal bounces (`ior: 1.5`, `dispersion: 0.022`) against a texture snapshot of the underlying page + analytical grid lines, and can be spun/dragged (`movable="true"`).
- **Seasonal Jack-o'-Lantern (`<jack-o-lantern>`):** Hidden unless Oct 25–Nov 1 (`data-halloween="true"`).

### 6. Sticker-Like Elements
- Covered by the WebGL2 holographic bear sticker above (`[data-holo-sticker]`) — die-cut outline mask (`uMask`), glossy/holographic foil bands, soft contact shadow, and tactile peel/crease physics.

### 7. Background Grid (`[data-pluckable-grid]`, `mount.Cg7qMrcO.js`)
- **Initial State:** Fixed full-viewport `<canvas>` (`z-index: -1`, `pointer-events: none`) rendering crisp 1px grid lines every **`40px`** (`offset: [0.36, 0.32]`) in `--color-rule` (`10%` ink light / `20%` ink dark), masked by a diagonal linear gradient (`angle: 125deg`, fading from `0%` opacity at `60%` of the diagonal to full rule opacity in the corner).
- **Trigger:** Desktop fine pointer only (`(hover: hover) and (pointer: fine)`), excluding interactive elements and `[data-pluck-exclude]` (the main content column).
- **Animation Sequence & Movement:** Moving within `hitRadius: 5px` of a grid line switches cursor to `grab`; pressing/dragging (`grabbing`) pulls the grid line like a taut string up to `maxPull: 40px` (`tension: 7`, `damping: 4`, 16 harmonic modes); releasing or strumming across lines vibrates them back to rest with a subtle highlight (`0.08`) and glow (`0.3`), plus optional Web Audio plucked-string tone.
- **Mobile Considerations:** Automatically disabled on coarse/touch pointers (`!fine.matches`); canvas frees memory when tab is hidden.

### 8. Small Hover Interactions
- **Prose links (`.link-prose`):** `2px` underline in `--color-accent` (`red-600` light / `red-400` dark), `text-underline-offset: 0.2em`. On `:hover` / `:focus-visible`, fills solid `--color-accent` background with inverted `canvas` text color (`0.15s cubic-bezier(0.4, 0, 0.2, 1)`).
- **UI & List links (`.link-ui`, `LATEST` rows, footer presence links):** Text and leading `16px` icon shift cleanly from ink/muted to `--color-accent` on hover/focus.
- **Top-left gem nav icon:** Fixed on `lg+`, absolute on smaller screens; `hover:text-ink`.

### 9. Typography Treatments
- **Wordmark:** Fluid SVG display `<h1>` (`clamp(4rem, 3.83rem + 0.726vw, 4.511rem)`, `line-height: 1`).
- **Metadata / Labels:** Uppercase monospace (`ui-monospace, SFMono-Regular, Menlo, ...`), `text-meta: 0.75rem`, `letter-spacing: 0.06em`, `font-weight: 500`; `text-micro: 0.625rem` for colophon.
- **Scramble / Decode Text Reveal (`scramble.BYd-10cx.js`):** On load (`LATEST`: `delay: 900ms`, `stagger: 125ms`) and on scroll into view (footer presence telemetry), text scrambles through random alphanumerics (`50ms` churn) and resolves left-to-right with quadratic ease-out (`1 - (1 - d)^2`) over `400–900ms` (`rate: 30 chars/s`). Instant reveal under `prefers-reduced-motion`.

### 10. Other Distinctive Interactive Details
- **Global Sound Toggle (`[data-sound-toggle]`):** Subtle icon button in the footer colophon toggling Web Audio synthesized sounds across the grid, birds, and sticker.
- **Page Entrance Reveal:** Main content column enters with `reveal 0.35s ease-out 0.5s backwards` (`blur(4px) → 0`, `translateY(1rem) → 0`, `opacity: 0 → 1`).
- **Live Telemetry Marquee:** Long Spotify track text in the footer smoothly scrolls (`telemetry-marquee 18s–33.7s linear infinite`) inside a horizontal gradient fade mask once unscrambled.

---

## 7. Portfolio Reference Mapping

Only sections with an actual, direct reference are assigned. No reference is forced where it does not apply.

| Portfolio Area | Structural Reference | Visual Reference | Interaction Reference |
|---|---|---|---|
| **Global Shell & Navigation** | **Tania Rascia** — Desktop fixed `260px` left sidebar (site mark, short bio, primary nav, social/utility links) + mobile `60px` top bar. | **109ichiki** — High-contrast monochrome dark/light palette (`#101016` / `#f3f3ff`), `1px` hairline borders, `IBM Plex Mono` UI labels, rounded outer viewport frame & light/dark toggle dots. | **Jhey Tompkins** — Pluckable `40px` diagonal-fade background grid (`[data-pluckable-grid]`), optional global sound toggle in colophon. |
| **Homepage Hero** | **Tania Rascia** — Left-column greeting, tagline, bio/intro hierarchy + right-column visual focal slot. | **109ichiki** — Wavy wireframe canvas grid + draggable OS-style `*.webp` masking portal windows revealing synced/zoomed focal artwork + barcode accent. | **Jhey Tompkins** — Mechanical crane/claw dropping the dot onto the letter `i` in the name mark (if name contains `i` — see §9), handwritten SVG signature draw-on animation, birds perched on the `FOLLOW` link that flee on hover and return, optional holographic peelable sticker. |
| **Timeline** | **Tania Rascia** — `"A brief timeline"` vertical list with fixed-width monospace date spans (`YYYY–YYYY`) and narrative text with inline links. | **109ichiki** — `1px` horizontal hairlines / `IBM Plex Mono` date styling (optional subtle adaptation). | **Jhey Tompkins** — Inverted-block `.link-prose` hover treatment on inline links. |
| **Works Showcase** | **Tania Rascia** — Homepage section slot & dedicated `/projects` (or `/works`) archive link. | **109ichiki** — **Stage 1:** Sticky full-viewport CRT/VHS scroll-driven category showcase with glitch transitions, HUD overlay, and cascading bottom-right OS dialog cards. **Stage 2:** Full-width horizontal ruled `Pickup Works` rows with pill tags, thumbnail, and color-inverting hover arrow. | **109ichiki** (primary: scroll-scrubbed VHS glitch, `750ms` image cycling, click-to-pause timecode) + **Jhey Tompkins** (optional scramble-decode on HUD/row titles). |
| **Latest Content** | **Tania Rascia** — `"Latest"` heading + `"All Posts"` button, vertical list rows with leading icon, title, date, and right-aligned `#tag` chips. | **109ichiki** — `1px` ruled list dividers & monospace tag/date styling. | **Jhey Tompkins** — Scramble-decode entrance on list titles + `.link-ui` accent hover on row & icon. |
| **Shelves / Collections** | **Tania Rascia** — Homepage 2-column shelf cards (title, item count chip, description) + `/shelves/` grouped 2-column icon+title link lists. | **109ichiki** — Crisp `1px` monochrome card borders, OS-dialog-inspired header or monospace count chips. | **Jhey Tompkins** — Clean `.link-ui` hover accent; optional movable refractive gem beside list. |
| **Series** | **Tania Rascia** — `"Series"` heading, subtitle, vertical list with icon, title, and description. | **109ichiki** — Monospace metadata & hairline dividers (where applicable). | **Jhey Tompkins** — `.link-ui` hover accent. |
| **About / Profile** | **Tania Rascia** — Dedicated `/me` (or `/about`) page structure + sidebar bio link. | **109ichiki** — Split `PROFILE_` layout with wavy grid and cascading `profile.jpg` OS dialog window trail. | **109ichiki** — Draggable/blinking `profile.jpg` OS windows. |
| **Footer** | **Tania Rascia** — Main-column-aligned footer with primary links, stack/credit badges, and maker line. | **109ichiki** — `1px` top hairline, barcode graphic, monospace credits/copyright. | **Jhey Tompkins** — Optional live presence/status telemetry readout with scramble-decode + sound toggle. |

---

## 8. Observed Behavior vs. Technical Implementation Hypotheses

### Directly Observed (Verified from Live Code & Supplied Media)
- **Tania Rascia:** Exact CSS variables, `260px` sidebar + `760px`/`1020px` content widths, section order, typography stacks, and responsive collapse behavior.
- **109ichiki Hero Masking:** Exact `overflow: hidden; contain: paint` OS dialog bodies containing full-viewport `100vw × 100svh` artwork layers inverse-translated (`translate3d(-currentX, -currentY, 0)`) by JS class `xM` while dragged via `Od`, plus GSAP `clip-path: inset(...)` opening wipe and `500ms` blink on `×` click.
- **109ichiki Works Showcase:** Exact `position: sticky` viewport container, 4 GSAP `ScrollTrigger` spacers, WebGL FBO CRT shader (`uShake` spiking to `0.252` on `0.3s power3.inOut` transitions), `750ms` auto-cycle, click-to-pause timecode, cascading bottom-right dialogs (`0.625rem * --_index`), and 6-row ruled `Pickup Works` list.
- **Jhey Tompkins Interactions:** Exact SVG `pathLength="1"` signature draw + `6s` blink, 4-keyframe `3.4s` crane/claw/dot-bounce sequence on `i`, 10-spring + Hermite-spline bird flock with `pointermove`/`focus` flee and `900ms` touch return, `40px` diagonal-fade pluckable canvas grid, WebGL2 peelable holographic sticker with 12 remembered creases, WebGL2 5-bounce refractive gem, and `scramble.BYd-10cx.js` decode timing.

### Technical Implementation Hypotheses (For Future Build Phase)
- **Hero Masking Without Heavy WebGL:** The core 109ichiki hero masking effect is pure DOM + CSS (`overflow: hidden`) + lightweight JS (`getBoundingClientRect` + pointer drag → inverse `translate3d`). It does **not** require WebGL unless we also want 3D floating foreground objects.
- **Works Showcase CRT/Glitch Effect:** Can be faithfully recreated either with a lightweight WebGL/Three.js fragment shader (matching 109ichiki's exact `uShake` + scanlines + chromatic aberration) or a hybrid CSS/Canvas2D fallback for reduced-motion / non-WebGL devices.
- **Sidebar + Viewport Frame Coexistence:** Combining Tania's `260px` sticky left sidebar with 109ichiki's full-viewport hero and sticky works showcase requires scoping the sticky works showcase and hero width to the main content column (`1fr`) on desktop, or letting the hero span the main pane inside the outer viewport frame.

---

## 9. Locked Decisions (User Approved)

The following constraints are locked in and govern all future design and implementation phases:

1. **Framework & Styling:** **Vite + React + TypeScript**, styled with **custom CSS / CSS Modules**. No `shadcn/ui` or generic component libraries.
2. **Navigation & Page Structure:** Preserve **Tania Rascia's** actual navigation (`260px` persistent desktop left sidebar + `60px` mobile top navbar) and homepage section structure:
   - Introduction
   - Timeline
   - Latest
   - Shelves
   - Series
   - Projects (Works Showcase)
   - About / Profile
   - Footer
   *(Do not replace Tania's navigation with 109ichiki's or Jhey's navigation; adapt visual styling only where the references justify it.)*
3. **Identity:** Name is **`Akshat`**.
4. **Works Showcase Categories & Projects:**
   - Categories: **AI & Agent Engineering**, **Backend & Infrastructure**, **Systems & Experiments**.
   - Projects (do not invent others): **HookRelay**, **Anavya**, **Fleet Telemetry**.
5. **Handwritten Signature:** Deferred until after the hero design is established (no fake or AI-generated signature).
6. **Hero Masking Visual Asset:** No AI-generated artwork. Use a clean temporary placeholder *only* if needed during development; actual asset to be decided separately.
7. **Audio:** **No synthesized audio or sound effects.** All interactions remain purely visual (omit Jhey's Web Audio engine and colophon sound toggle).
8. **3D / WebGL Discipline:** Do not independently add effects. Every effect must be verified as present in the supplied `references/` assets and explicitly approved before implementation; avoid unnecessary WebGL complexity.

---

## 10. Detailed Colour Audit of All Three References

*(For joint review before finalizing our combined colour theme.)*

| Token / Role | **Tania Rascia** (`tania_1.png`, `tania_2.png`) | **109ichiki** (`ichika_1.png`, `ichika_vid.mp4`) | **Jhey Tompkins** (`Jhey.mp4`) |
|---|---|---|---|
| **Dark Bg (Primary)** | `#202025` (`--gray-9`, warm-neutral charcoal) | `#101016` (`--color-black-2`, deep cool blue-black) | `#000000` (pure black) |
| **Dark Bg (Sidebar / Alt)** | `#16161a` (`--gray-11`), Tags/Cards: `#28282e` (`--gray-8`) | `#101016` (flat monochrome; depth via `1px` borders) | `#000000` |
| **Dark Text (Primary)** | `#fbfbfb` / `#eee` (high-legibility off-white) | `#ffffff` (`--color-white-1`) | `#ffffff` (`canvasText`, body at `96%`) |
| **Dark Text (Muted)** | `#a1a1a8` (`--gray-5`) | `#a4a4a4` (`--color-white-3`) | `80%` / `70%` ink (`color-mix`) |
| **Dark Borders / Grid** | `#4e4e55` (`--gray-6`), Card: `#323239` (`--gray-7`) | `#a4a4a4` (`--color-white-3`, crisp `1px`) | `20%` ink (`color-mix` hairline grid) |
| **Light Bg (Primary)** | `#f8f4e6` (`--beige-0`, warm parchment) | `#f3f3ff` (`--color-white-2`, cool lavender-white) | `#ffffff` (pure white) |
| **Light Bg (Alt / Tags)** | `#f1ead5` (`--beige-1`), `#ece4ca` (`--beige-2`) | `#f3f3ff` | `#ffffff` |
| **Light Text / Borders** | Dark charcoal / `#ded4b2`–`#c6ba93` | `#101016` text / `#565656` (`--color-black-3`) borders | `#000000` text / `10%` ink grid |
| **Accent Colour(s)** | Selectable: Pink `#f2777a` (dark) / `#b12d6c` (light), Yellow `#fede91` / `#b26a34`, Blue `#6db3f5`, Lavender `#e5aaf5`, Green `#94d294` | **Monochrome UI chrome**; colour comes strictly from artwork (neon magenta / electric cyan / periwinkle) + CRT HUD `#ff0000`/`#00ffff` drop-shadow | Coral-Red `oklch(70.4% .191 22.216)` (≈ `#f87171` dark) / `#dc2626` (light); Birds `#4493d0` (sky blue) |

**Key Colour Observation:** 109ichiki's visual power comes from its **high-contrast, ultra-clean cool monochrome chrome** (`#101016` dark / `#f3f3ff` light with crisp `1px` `#a4a4a4` / `#565656` hairlines) that lets focal visuals and subtle interactive accents stand out without visual noise.

---

## 11. 109ichiki Hero Masking Asset Requirements

Based on direct inspection of `ichika_1.png`, `ichika_vid.mp4`, and `109ichiki`'s live CSS/JS (`class xM`):

- **Why the effect works visually:**
  1. Behind everything is the **wavy wireframe grid** (`_kvGrid`).
  2. In front of the grid sits the **base image** (`_kvMainImage`), which in 109ichiki is a **transparent-background PNG/WebP cutout** (`meme_full.webp`) so the grid remains visible around the silhouette.
  3. Overlapping both are **draggable OS windows** (`_kvDialog`) whose inner body (`_body`) has an **opaque `var(--color-bg)` background** and `overflow: hidden`. Inside each window is a full-viewport (`100vw × 100svh`) container holding a **zoomed/detail scale** of the subject (`_kvDialogImagePc`) inverse-translated (`translate3d(-x, -y, 0)`) as the window moves.
- **What asset characteristics make this effect work cleanly:**
  - **Ideal:** A high-resolution (`≥ 1600px` tall/wide) **transparent-background cutout** (e.g., portrait cutout, monochrome/duotone photo cutout, or crisp architectural/technical graphic) so the wavy grid shows around the base layer while each OS window reveals an opaque-backed zoomed crop.
  - **Alternative (if using a rectangular/opaque image):** The base layer sits inside a framed area over the wavy grid, and the draggable OS windows reveal a zoomed/shifted or alternate visual treatment locked to viewport coordinates.

---

## 12. Verification Matrix: Effects Actually Present in Supplied `references/`

Strict factual inventory of what **is** visibly present in your supplied reference files:

| Effect / Element | Present in Supplied `references/`? | Evidence | WebGL Required? | Status |
|---|---|---|---|---|
| **109ichiki draggable OS-window hero masking** | **Yes** | `ichika_1.png`, `ichika_vid.mp4` (`0s–12s`, `95s`) | **No** (pure DOM + CSS `overflow: hidden` + JS `translate3d`) | Core target — awaiting Hero approval |
| **109ichiki wavy wireframe grid** | **Yes** | `ichika_1.png`, `ichika_vid.mp4` (`0s–20s`, `55s–65s`, `95s`) | **No** (Canvas 2D) | Core target — awaiting Hero approval |
| **109ichiki floating white 3D foreground objects (`mochiusa`)** | **Yes** | `ichika_1.png` (3 figures), `ichika_vid.mp4` (`0s–2s`) | Yes (Three.js) in reference | **Awaiting approval** (include, adapt, or omit?) |
| **109ichiki sticky Works Showcase + CRT/VHS glitch & cascading category dialogs** | **Yes** | `ichika_vid.mp4` (`25s–45s`) | WebGL shader in reference; Canvas2D/CSS hybrid possible | **Awaiting approval** (CRT/glitch vs. clean non-CRT sticky transition?) |
| **109ichiki `(PICKUP WORKS)` horizontal ruled rows** | **Yes** | `ichika_vid.mp4` (`50s`, `85s–90s`) | **No** (CSS Grid) | Core target — awaiting Works approval |
| **109ichiki cascading `profile.jpg` OS window trail** | **Yes** | `ichika_vid.mp4` (`55s–60s`) | **No** (DOM + CSS) | **Awaiting approval** for About/Profile |
| **109ichiki 3D rotating footer character + holographic ribbon** | **Yes** | `ichika_vid.mp4` (`65s`, `85s–90s`) | Yes (Three.js) in reference | **Awaiting approval** (likely omit to avoid unnecessary WebGL) |
| **Jhey mechanical crane dropping dot on `i`** | **Yes** | `Jhey.mp4` (`00:03–00:07`) | **No** (pure SVG + CSS keyframes) | **Awaiting adaptation decision** for `"Akshat"` (see §13) |
| **Jhey birds on `FOLLOW` fleeing on hover & returning** | **Yes** | `Jhey.mp4` (`00:12–00:20`) | **No** (SVG + JS springs/splines) | Core target — purely visual (no audio) |
| **Jhey handwritten signature draw-on** | **Yes** | `Jhey.mp4` (`00:00–00:02`, `00:05–00:07`) | **No** (SVG `stroke-dashoffset`) | Deferred until user supplies SVG |
| **Jhey hanging/peelable bear sticker above `h1`** | **Yes** | `Jhey.mp4` (`00:00–00:28`) | Yes (WebGL2) in reference | **Awaiting approval** (omit unless user supplies a sticker asset & wants it) |
| **Jhey movable faceted refractive gem beside `LATEST`** | **Yes** | `Jhey.mp4` (`00:00–00:28`) | Yes (WebGL2) in reference | **Awaiting approval** (omit to avoid unnecessary WebGL) |
| **Jhey subtle diagonal-fade background grid (pluckable on desktop)** | **Yes** | `Jhey.mp4` (`00:00–00:28`) | **No** (Canvas 2D) | **Awaiting approval** (purely visual, no audio) |
| **Jhey scramble-decode text reveal on `LATEST`** | **Yes** | `Jhey.mp4` (`00:03–00:05`) | **No** (lightweight JS) | **Awaiting approval** |

---

## 13. Mechanical Crane Dot Animation Analysis for `"Akshat"`

In Jhey's implementation (`[data-namemark]`), the crane/claw works specifically because the wordmark (`Jhey Tompkins`) has a **discrete, circular typographic dot** (the tittle of lowercase `i`) that can be cleanly detached, lowered from above the viewport, dropped with a two-bounce landing, and released without distorting any letterform.

Because **`Akshat`** contains no `i` or `j`, forcing the crane onto a letter stroke would break the fidelity of the effect. Faithful options grounded directly in Jhey's mechanism:

1. **Option A — Terminal period (`Akshat.`):** Add a typographic period at the end of the hero wordmark (`Akshat.`) and have Jhey's exact crane/claw lower and drop that period into place with the two-bounce settle.
2. **Option B — Domain / handle dot (`akshat.dev` or similar):** If the hero or sidebar brand mark uses a dot-separated handle, the crane drops the `.` into place.
3. **Option C — Omit the crane animation:** Keep `"Akshat"` clean without forcing a dot if you don't want punctuation in your hero name.

---

## 14. Approved Decisions Update & Sampled 109ichiki Fluorescent Accents

### Newly Locked Decisions
- **Monochrome Chrome (109ichiki):**
  - Dark mode: `#101016` background, `#FFFFFF` primary text, `#A4A4A4` crisp `1px` borders & muted ink.
  - Light mode: `#F3F3FF` background, `#101016` primary text, `#565656` crisp `1px` borders & muted ink.
  - **Strict No-Gradient Rule:** No CSS gradients anywhere unless explicitly specified and approved.
  - Bold outlines and artwork-led presentation preserved; accent colour used selectively (links, active indicators, hover states, focal highlights) — never as a neon-gradient wash.
- **Directly Sampled 109ichiki Fluorescent Accents (from `references/ichika_1.png`):**
  - **Fluorescent Magenta-Pink (dominant artwork accent):** `#FC64F4` (cluster `#FC64F4`–`#FC68F8`, dominant hair highlight)
  - **Electric Cyan-Blue (secondary artwork accent):** `#00A0FC` (cluster `#009CFC`–`#00A0FC`, eyes & highlights)
  - *(Note: On `#F3F3FF` light mode, `#FC64F4` or `#00A0FC` may need a contrast check for small text — awaiting confirmation on which sampled accent should be the primary selective accent.)*
- **Hero Wordmark & Mechanical Crane:** **`Akshat.`** — the trailing `.` is lowered, dropped with the exact two-bounce landing, and released by Jhey's SVG mechanical crane/claw (`3.4s` duration, `1.6s` delay, `prefers-reduced-motion` safe).
- **Approved Effects Roster:**

| Effect | Decision |
|---|---|
| 109ichiki draggable OS-window hero masking + wavy wireframe grid | **Keep** (DOM + CSS `overflow: hidden` + JS `translate3d` + Canvas 2D) |
| 109ichiki Works Showcase (sticky category showcase + Pickup Works ruled rows) | **Keep** (3 categories: AI & Agent Engineering, Backend & Infrastructure, Systems & Experiments; projects: HookRelay, Anavya, Fleet Telemetry) |
| Jhey mechanical crane dot on `Akshat.` | **Keep** (pure SVG + CSS keyframes) |
| Jhey handwritten SVG signature animation | **Keep** (slot reserved in hero; SVG path supplied later — no fake signature) |
| Jhey birds scattering on `FOLLOW` hover and returning | **Keep** (purely visual, no audio) |
| Hanging decorative elements (matching reference) | **Keep** (where matching the supplied references; exact asset/placement confirmed per section) |
| Jhey pluckable background grid | **Keep** (Canvas 2D, purely visual, no audio) |
| Jhey `LATEST` scramble-decode | **Keep** |
| Synthesized audio | **Omit** |
| Unverified or newly invented effects | **Omit** |

---

## 15. Section 1 Blueprint: Homepage Hero (Awaiting Approval)

*No code will be written until this blueprint is reviewed and approved.*

### Layout & Structural Foundation (Tania Rascia + 109ichiki Chrome)
- **Outer Shell:** Tania Rascia's persistent `260px` sticky left sidebar on desktop (site brand, short bio, icon+label nav: `Blog`, `Shelves`, `Projects`, `About me`, bottom social/utility links, light/dark toggle) + `60px` fixed mobile top navbar. Styled in 109ichiki's `#101016` / `#F3F3FF` monochrome chrome with crisp `1px` hairline borders and `IBM Plex Mono` UI chrome.
- **Global Background:** Jhey's `40px` diagonal-fade pluckable `<canvas>` grid (`z-index: -1`, desktop fine-pointer pluckable, purely visual, zero audio, excluded over interactive/content zones).
- **Hero Composition (inside the main content pane, 2-column desktop split):**
  - **Left Column (Tania Intro Hierarchy + Jhey Micro-Interactions):**
    1. **Wordmark (`<h1>`):** Inline SVG **`Akshat.`** where the trailing `.` is lowered and dropped into place by Jhey's mechanical crane/claw (`ride` → `claw` open → `dot-place` two-bounce → `arm` retract).
    2. **Tagline & Intro Copy:** Crisp role line (tracked uppercase monospace, Jhey-inspired) + concise developer intro with Jhey's `.link-prose` solid-fill inverted hover links.
    3. **Action Links Row (Jhey):** Monospace uppercase links separated by `·` (e.g., `PROJECTS · EMAIL · GITHUB · FOLLOW`), with **Jhey's SVG blue birds perched on `FOLLOW`** that scatter along Hermite splines on pointer approach/focus and fly back after withdrawal (`900ms` on touch).
    4. **Reserved Signature Slot:** Clean layout space beside/below the action links reserved for your future handwritten SVG signature (left empty until you supply the SVG).
    5. **Hero Metadata & Barcode (109ichiki):** Small bottom-left monospace label + decorative `Libre Barcode 128` graphic.
  - **Right Column (109ichiki Hero Masking Stage):**
    1. **Back Layer:** 109ichiki Canvas 2D wavy wireframe perspective grid (`data-outline="true"`).
    2. **Base Visual Layer:** Temporary neutral geometric/architectural placeholder (clearly marked as placeholder, no AI illustration) with GSAP/CSS `clip-path: inset(...)` opening wipe.
    3. **Masking Portal Windows (3–4 on desktop, 2 on mobile):** Overlapping `1px`-bordered retro OS dialog boxes (`titlebar` + `×` button that blinks `500ms` on click, `cursor: grab → grabbing` drag handle). Each window has `overflow: hidden` + opaque `var(--color-bg)` body containing a viewport-locked zoomed layer inverse-translated (`translate3d(-x, -y, 0)`) as you drag the window.

### Quick Confirmations Needed to Lock Section 1 (Hero)
1. **Primary Selective Accent:** Between the two fluorescent colours directly sampled from `ichika_1.png` — **`#FC64F4`** (fluorescent magenta-pink, dominant) and **`#00A0FC`** (electric cyan-blue, secondary) — which one should be our primary selective accent (or `#FC64F4` primary + `#00A0FC` secondary)?
2. **Hero Placeholder Asset:** Is a minimal monochrome typographic/wireframe placeholder acceptable inside the 109ichiki masking windows during Section 1 development until you supply your real image?
3. **Hero Copy & Links:** Do you want to provide your exact 1-line tagline, 2–3 line intro bio, and `FOLLOW` target URL now, or use minimal structural copy for Section 1 review?
4. **Hero Hanging Element:** In `Jhey.mp4`, the hanging/floating object above `h1` is Jhey's bear sticker. Since we will not invent or AI-generate illustrations, should we reserve that hanging anchor slot until you supply a graphic, or omit it from the hero?
