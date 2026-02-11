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
