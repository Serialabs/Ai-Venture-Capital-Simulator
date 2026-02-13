# QA_CHECKLIST

Use this checklist for desktop and mobile validation of report-page behavior.

## Test matrix
- **Desktop**: 1440px, 1280px, 1024px.
- **Mobile**: 390px (iPhone), 360px (Android baseline).
- **Browsers**: Chrome latest, Safari (if available), Firefox latest.
- **Modes**: normal motion + reduced motion.

## 1) Visual checks

### Desktop
- [ ] Header remains readable and visually stable while sticky.
- [ ] Report container width and spacing match design intent.
- [ ] Card borders, background contrast, and meta-chip legibility are consistent.
- [ ] Typography hierarchy is clear (eyebrow, h1/h2, body, chips).
- [ ] Footer spacing and divider lines render correctly.

### Mobile
- [ ] Navigation wraps gracefully with no overlap.
- [ ] Grid/card layouts collapse to single-column where expected.
- [ ] Text does not clip/truncate unexpectedly.
- [ ] Chips wrap cleanly without overflow.
- [ ] Sticky elements do not obscure section headings.

## 2) Interaction checks

### Data/hydration behavior
- [ ] Report page loads placeholder state before hydration.
- [ ] Correct report metadata appears for each slugged report page.
- [ ] Missing/unknown slug does not crash page; static content remains visible.
- [ ] Published report list renders cards with working links.
- [ ] Fetch failure path shows clear error card.

### Input/navigation behavior
- [ ] All header/report links are keyboard-focusable.
- [ ] Focus indicators remain visible in dark theme.
- [ ] Tab order follows logical reading sequence.

## 3) Animation checks

### Normal motion
- [ ] Reveal animations trigger once when components enter viewport.
- [ ] Stagger feels subtle; no delayed “waiting” for key content.
- [ ] No jarring jumps, flicker, or layout shifting during reveal.
- [ ] Error/loading states remain understandable with motion enabled.

### Reduced motion
- [ ] `prefers-reduced-motion` disables transform-based movement.
- [ ] Content appears immediately (or near-immediately) without sequencing delay.
- [ ] UX parity preserved (same information and interaction availability).

## 4) Data checks
- [ ] `assets/data/reports.json` entries include required fields (`slug`, titles, verdicts, date).
- [ ] Verdict values conform to allowed enum set.
- [ ] Report detail payload keys align with renderer expectations.
- [ ] Empty arrays/optional fields degrade gracefully.
- [ ] No console errors from JSON parsing or missing properties.

## 5) Performance checks

### Runtime
- [ ] IntersectionObserver count remains low (single observer instance preferred).
- [ ] Reveal logic unobserves elements after first reveal.
- [ ] Animations use only `opacity`/`transform`.
- [ ] No repeated DOM rewrites in scroll path.

### Measured signals (desktop + mobile emulation)
- [ ] No long tasks introduced by hydration/animation setup.
- [ ] CLS remains stable relative to baseline.
- [ ] FPS stays smooth during first scroll pass through report sections.
- [ ] Memory does not climb materially after repeated page navigations.

## Sign-off criteria
- [ ] All visual and interaction checks pass on desktop and mobile.
- [ ] Animation checks pass in normal + reduced motion modes.
- [ ] Data validation passes with zero critical console/runtime errors.
- [ ] Performance checks show no regression versus pre-animation baseline.

## PR/release checklist (Pages deployment)
- [ ] For GitHub Pages deployment retries, use a **fresh run only** (start via `workflow_dispatch` or a new commit).
- [ ] If a run failed after artifact upload, do **not** click **Re-run** on that same run.
