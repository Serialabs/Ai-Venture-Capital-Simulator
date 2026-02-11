# Specific Build Plan (Executed + Next Steps)

## Phase 1 — Foundation (Completed)

- [x] Create static root pages: `index.html`, `about.html`.
- [x] Create report page directory `reports/` with first two reports.
- [x] Add shared stylesheet and JS in `assets/`.
- [x] Add data-driven content files:
  - `assets/data/reports.json`
  - `assets/data/personas.json`
- [x] Include required disclaimers and required footer credit text.

## Phase 2 — Core UX (Completed)

- [x] Home page sections:
  - Hero
  - Disclaimer strip
  - Static upload placeholder
  - 4-stage pipeline block
  - Data-driven published reports list
- [x] About page sections:
  - Method summary
  - 4-stage process
  - Debate structure
  - Persona roster loaded from JSON
- [x] Report template with fixed structure:
  - Executive Summary
  - Key Insights
  - Founder Questions
  - Action Plan

## Phase 3 — GitHub Pages Readiness (Completed)

- [x] Keep paths relative for static hosting compatibility.
- [x] Add `README.md` with deployment steps.
- [x] Ensure no backend/API dependencies.

## Phase 4 — Content Expansion (Next)

1. Add 3–5 additional report pages under `reports/`.
2. For each new report, update `assets/data/reports.json`.
3. Keep every report on the same 4-section contract for consistency.
4. Add evidence pointer lines (`p.X`, snippet labels) to each section.
5. Standardize decision labels (`Lean Invest`, `Lean Pass`, `Dig Deeper`).

## Phase 5 — Editorial Rules (Next)

1. Keep all copy original and avoid mirrored phrasing from references.
2. Mark unknowns as `Not found in deck` where evidence is absent.
3. Maintain disclaimer text on Home and About pages.
4. Do not publish confidential material.

## Phase 6 — Optional Polish (Next, still static)

1. Add client-side tag filtering for report cards (no backend).
2. Add `sitemap.xml` and basic `robots.txt`.
3. Add Open Graph tags per page for better social sharing previews.
4. Add print stylesheet for cleaner PDF exports.
