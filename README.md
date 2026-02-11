# Signal Ledger (Static GitHub Pages Site)

A static AI investment-committee blog format for publishing structured startup analyses.

## Live URL behavior

If `https://serialabs.github.io/` shows a 404, that means your user-site repo (`serialabs.github.io`) is not configured.
This repository publishes as a **project site**:

- `https://serialabs.github.io/Ai-Venture-Capital-Simulator/`

## Deployment setup

This repo includes `.github/workflows/pages.yml` for GitHub Pages deployment.

1. Push to `main`.
2. Go to **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Wait for the **Deploy static site to GitHub Pages** workflow run to finish.
5. Open the project URL above.

## Pages in this site

- `index.html` — home page with submit card, how-it-works summary, report feed, and project overview.
- `prompt.html` — pipeline mechanics, debate rounds, persona cards, and copyable raw prompt block.
- `about.html` — concise method + disclaimers and persona roster.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Add a report

1. Create `reports/<slug>.html`.
2. Add a metadata object in `assets/data/reports.json` with:
   - `slug`, `title`, `summary`, `stage`, `year`, `tags[]`, `invest_count`, `pass_count`, `dig_deeper_count`
3. Commit and push.

## Notes

- This build is static and API-free.
- Keep the required disclaimers visible.
- Footer credit is included as requested.
