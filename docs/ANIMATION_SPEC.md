# Animation & Interaction Spec (Report Pages)

## Motion model

### Reveal-on-enter (IntersectionObserver)
- **Selector**: `.reveal` nodes (cards, TOC, action rows, and any report elements marked for reveal).
- **Start state**: `opacity: 0; transform: translate3d(0, 16px, 0)`.
- **End state**: `opacity: 1; transform: none` when `.is-visible` is added.
- **Duration**: `420ms`.
- **Easing**: `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Stagger**: `70ms` incremental delay per revealed item (`index * 70ms`).
- **Observer trigger**:
  - `threshold: 0.12`
  - `rootMargin: 0px 0px -12% 0px`
- **One-shot reveal**: item is unobserved after first intersect.

### Scrollspy model
- **Observed targets**: report section headings (`.report-section h2, h3`) with generated stable IDs.
- **Observer settings**:
  - `threshold: [0, 0.25, 0.6]`
  - `rootMargin: -30% 0px -55% 0px`
- **Active state rule**: when heading intersects, matching TOC link gets `.is-active`; previous active link is cleared.

### Reading progress model
- **Formula**: `progress = clamp(scrollTop / (docHeight - viewportHeight), 0..1)`.
- **Visual**: top fixed bar using `transform: scaleX(progress)` from left origin.
- **Update events**: `scroll` (passive) and `resize`.

## Reduced-motion path (`prefers-reduced-motion: reduce`)
- Reveal items are made immediately visible (no entrance transform).
- Stagger delay is forced to `0ms`.
- Transition/animation disabled for reveal/progress/collapsible-affecting UI.
- Scrollspy/TOC/progress state still updates functionally, but visual changes occur instantly.

## Collapsible behavior (persona/round sections)
- Any `.report-section` with heading text/class matching `persona|round` is upgraded to a collapsible block.
- A button (`.report-collapsible__toggle`) controls panel visibility via `aria-expanded` and `aria-controls`.
- Keyboard support:
  - Native button activation.
  - Explicit handling for `Enter` and `Space` to toggle state.
- Default state: collapsed (`aria-expanded="false"`, panel `hidden`).

## Copy actions
- **Report-level actions**:
  - Copy full report text.
  - Copy canonical report URL.
- **Section-level actions** (per heading):
  - Copy section text.
  - Copy deep link URL with heading hash.
- **Feedback**: success/failure label swap, then reset after `1200ms`.

## Acceptance criteria
1. Elements with `.reveal` become visible when entering viewport and do not re-animate repeatedly.
2. TOC is generated from report headings and each entry links to a stable in-page heading ID.
3. TOC active state tracks currently viewed section as user scrolls.
4. Reading progress bar reflects full-page read progress from top to bottom.
5. Persona/round sections can be expanded/collapsed with mouse and keyboard (Enter/Space).
6. Copy actions work for full report, sections, and links with visible feedback.
7. With reduced motion enabled:
   - No transform-heavy or staggered animation remains.
   - State transitions are immediate and content remains fully usable.
