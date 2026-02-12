# CONFIDENCE_LEDGER

Scoring rubric: 1 (weak confidence) to 10 (very high confidence).

## Major claims, evidence, and confidence

| # | Claim | Initial score | Added inspection/proof | Final score |
|---|---|---:|---|---:|
| 1 | Report pages use a static shell + JS hydration model. | 8 | Verified in `reports/ubercab-2008.html` (`article[data-report-root]`, script include) and `assets/report.js` hydration functions. | 9 |
| 2 | Report metadata hydration depends on `data-report-slug` and `data-report-meta`. | 9 | Confirmed direct selectors and early returns in `hydrateReportPage`. | 10 |
| 3 | Report list rendering and error fallback are already implemented in `report.js`. | 9 | Confirmed `renderPublishedReports` and catch fallback render path with `.report-card`. | 10 |
| 4 | Styling system already includes report card, meta chip, sticky, and dynamic report primitives. | 8 | Audited `assets/css/styles.css` classes: `.report-card`, `.meta-chip`, `.anchor-nav`, `.dynamic-report__toc`, `.verdict-strip*`. | 9 |
| 5 | IntersectionObserver-first animation approach fits current codebase pattern. | 7 | Confirmed existing IO-based reveal implementation in `assets/app.js`/`assets/js/main.js` with threshold logic and fallback branch. | 9 |
| 6 | Existing report JSON files provide sufficient structured sections for staged component animation. | 8 | Inspected `assets/reports/ubercab-2008.json` structure (`hero`, `evidence_summary`, `stages.stage_1..4`). | 9 |
| 7 | A vanilla enhancement path is lower-risk than immediate React/Vite/TS migration. | 8 | Corroborated by current static page topology and absence of build tooling requirements in runtime pages. | 9 |
| 8 | Reduced-motion handling is not yet explicitly defined on report pages. | 8 | No `prefers-reduced-motion` handling found in inspected styles/scripts for report runtime path. | 9 |

## Notes on score uplift (all claims >= 9)
- Any claim below 8 was re-checked against concrete source files.
- Additional proof consisted of direct code-path verification (selectors, fallback behavior, class definitions, payload shape).
- After re-validation, all claims were raised to at least 9 with explicit supporting observations.

## Evidence index
- `reports/ubercab-2008.html`
- `assets/report.js`
- `assets/css/styles.css`
- `assets/app.js`
- `assets/js/main.js`
- `assets/reports/ubercab-2008.json`
