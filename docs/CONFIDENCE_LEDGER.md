# Confidence Ledger — `youtube-2005.html` audit

| Claim | Confidence | Evidence type | Notes / caveats |
|---|---|---|---|
| Top navigation is fixed at viewport top from page load. | High | Computed style + scroll sampling (`position: fixed`, `top: 0`, stable rect top). | No competing sticky headers observed. |
| Scrollspy is not implemented as active-on-scroll state. | High | Free-scroll checks show no nav class toggles; only hash-jump behavior on click. | Visual emphasis during click is transient transition/hover/focus styling. |
| Reveal animation is observer-driven with threshold `0.1`. | High | Direct inline JS extraction. | Implementation is add-only (`visible` never removed). |
| Core transitions/animations are limited to nav links, memo cards, vc-eval cards, fade-in group, and hero intro keyframe. | High | CSSOM rule extraction for `transition`/`animation` declarations. | Easings for shorthand transitions default to UA default (`ease`) unless overridden. |
| No progress indicator math exists in this live page. | Medium-High | DOM/CSS/JS scans found no progress component/function. | Absence claims can miss dynamically injected modules; none detected in runtime session. |
| No expand/collapse controls are present. | High | Clickable census found only anchors (no buttons/details/aria-expanded). | Keyboard-only hidden controls were not detected either. |
| Local repo `reports/youtube-2005.html` matches deployed page behavior. | Low (rejected) | Side-by-side content characteristics diverge (title/content architecture differ). | Deployed page appears to come from a different artifact than local simplified report page. |
| PNG/PDF capture reconciliation is complete. | Low (blocked) | Repository search found no `.png` / `.pdf` assets to ingest. | Requires user-provided capture files or path/URI pointers. |

## Blocking items
1. Capture ingestion is blocked by missing artifact paths/files.
2. Once captures are provided, re-run a point-by-point diff table against the live behavior findings.
