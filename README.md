# Signal Ledger (Static GitHub Pages Site)

A static AI investment-committee blog format for publishing structured startup analyses.

## Website link

Use this project-site URL:

- **https://serialabs.github.io/Ai-Venture-Capital-Simulator/**

If you open `https://serialabs.github.io/` and see 404, that is the user-site root and requires a repo named exactly `serialabs.github.io`.

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
# resolve conflicts in files listed by GitHub
git add .
git commit -m "Resolve merge conflicts with main"
git push
```

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
