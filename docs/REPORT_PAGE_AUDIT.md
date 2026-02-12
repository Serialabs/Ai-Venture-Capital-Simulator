# Report Page Audit — `youtube-2005.html` (live GitHub Pages)

## Scope & method
- Target inspected: `https://ianparkvc.github.io/aivc/youtube-2005.html`.
- Tooling: Playwright runtime inspection (DOM/CSSOM/computed styles + interaction simulation).
- Local repo comparison target: `reports/youtube-2005.html`.

## Sticky thresholds

### Findings
1. The live page uses a **fixed** top nav (`nav.nav`) rather than a `position: sticky` element.
2. Effective pin threshold is immediate: nav is pinned at `top: 0` from initial paint.
3. No secondary sticky elements were detected.

### Evidence
- Runtime style scan returned a single pinned nav element with `position: fixed`, `top: 0px`, `z-index: 1000`.
- Scroll sampling across multiple offsets kept nav `getBoundingClientRect().top === 0` and `position: fixed`.

## Scrollspy activation behavior

### Findings
1. No JavaScript scrollspy implementation exists (only one inline script, and it is IntersectionObserver-based reveal logic).
2. Nav links do not gain active classes during free scroll.
3. Clicking a nav link updates URL hash and triggers smooth anchor scrolling; temporary visual highlight is hover/focus transition, not persistent scrollspy state.

### Evidence
- Inline JS is only:
  - an `IntersectionObserver` with `threshold: 0.1`.
  - adding `.fade-in` and `.visible` classes.
- During free-scroll sampling, all `.nav-links a` remained with empty `className` and base muted styling.
- Hash updates to `#stageN` after click, but after transition settles links revert to baseline style.

## Progress indicator math

### Findings
1. No explicit progress indicator component was found in DOM, CSS rules, or inline JS.
2. There is no progress computation function in the shipped script.

### Evidence
- CSSOM scan found no selectors containing `progress`.
- Inline JS contains no scroll-percentage math (only IntersectionObserver setup).

## Hover / click / expand states

### Findings
1. Implemented hover states:
   - `.nav-links a:hover` → text + background emphasis.
   - `.memo-card:hover` → border emphasis + `translateY(-2px)`.
   - `.vc-eval:hover` → border emphasis.
2. Click states:
   - nav anchor click changes hash and scrolls to `#stage1..#stage4`.
3. Expand states:
   - no accordion/details/button expand interactions detected.

### Evidence
- CSS `:hover` selector extraction returned only three hover rules above.
- Clickable element census found six anchors and no `button`, `details`, or `aria-expanded` controls.

## Live vs local repo reconciliation

### Findings
1. **Live page and repo file differ substantially.**
2. Live page is a long, heavily-styled single file (inline style/script, title `VC Investment Committee — YouTube (2005)`).
3. Local `reports/youtube-2005.html` is a short static report template with external shared CSS/JS and title `YouTube (2005) — Signal Ledger Report`.

### Implication
- Behavior validated above reflects the deployed GitHub Pages artifact, not the simplified local `reports/youtube-2005.html` source currently in this repo.

## PNG/PDF capture ingestion status
- No PNG/PDF captures were present in this repository at audit time (`rg --files | rg -i '\.(png|pdf)$'` returned nothing).
- Reconciliation against provided captures is therefore blocked pending artifact delivery/location.
