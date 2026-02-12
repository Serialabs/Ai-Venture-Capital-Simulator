# Signal Ledger (Static GitHub Pages Site)

A static AI investment-committee blog format for publishing structured startup analyses.

## Website link

Use this project-site URL:

- **https://serialabs.github.io/Ai-Venture-Capital-Simulator/**

If `https://serialabs.github.io/` shows 404, that is the user-site root and requires a repo named exactly `serialabs.github.io`.

## Site structure (3 separate pages)

- `index.html` → **Home**
- `how-it-works.html` → **How It Works** (pipeline, debate, persona visibility, prompt framing)
- `published-reports.html` → **Published Reports**

Legacy routes `prompt.html` and `about.html` now redirect to `how-it-works.html`.

## Deployment setup

This repo includes `.github/workflows/pages.yml` for GitHub Pages deployment.

1. Push to your default branch (`main` or `master`).
2. Go to **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Wait for the **Deploy static site to GitHub Pages** workflow run to finish.
5. Open the project URL above.

## Fixing “This branch has conflicts” on your PR

### Option A (recommended): helper script

```bash
git checkout <your-pr-branch>
./scripts/sync-with-default-branch.sh
# if conflicts appear, resolve them in your editor:
git add .
git commit -m "Resolve merge conflicts with default branch"
git push
```

### Option B: manual commands

```bash
git checkout <your-pr-branch>
git fetch origin
git merge origin/main
# if your default branch is master, merge origin/master instead
git add .
git commit -m "Resolve merge conflicts with main"
git push
```

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
