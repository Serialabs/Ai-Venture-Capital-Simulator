# Specific Build Plan (Current State + Next Steps)

## Phase 1 — Site Structure (Completed)

- [x] Home page (`index.html`) with sections: Hero, Submit, How It Works, Published Reports, About Project.
- [x] Prompt page (`prompt.html`) with 4-stage pipeline, debate rounds, persona cards, and raw prompt copy section.
- [x] About page (`about.html`) with method summary + disclaimer block.
- [x] Shared assets in `assets/css/styles.css` and `assets/js/main.js`.

## Phase 2 — Data Model (Completed)

- [x] Persona names in `assets/data/personas.json` (20-name roster).
- [x] Persona profile cards in `assets/data/persona_profiles.json`.
- [x] Report feed file in `assets/data/reports.json` (currently empty baseline).

## Phase 3 — Pages Deployment (Completed)

- [x] GitHub Pages Actions workflow in `.github/workflows/pages.yml`.
- [x] README documents project-site URL and root-domain 404 behavior.
- [x] Relative paths for GitHub Pages compatibility.

## Phase 4 — Content Authoring (Next)

1. Add your first real report page at `reports/<slug>.html`.
2. Populate `assets/data/reports.json` with that report metadata.
3. Follow fixed report sections:
   - Founder's Brief
   - Expert Opinions
   - Panel Discussion
   - Key Takeaways
4. Include verdict counts and tag chips in report metadata.

## Phase 5 — Quality Checklist (Next)

1. Ensure copy is original and not mirrored from references.
2. Keep disclaimers on Home/About pages.
3. Keep persona names exact and consistent with data file.
4. Confirm the Pages action run is green after each push.
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
