# Signal Ledger (Static GitHub Pages Site)

A static blog-style startup analysis site with a consistent VC-style report format.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish on GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch `main` (or your default branch) and folder `/ (root)`.
5. Save. GitHub Pages will publish the static files.

### Deployment retry note

- If GitHub Pages fails after artifact upload, **do not use Re-run** on that same workflow run.
- Trigger a **new workflow run** instead via `workflow_dispatch` or by pushing a new commit.

## Content workflow

To add a new report:

1. Create `reports/<slug>.html` using the same 4-section report structure.
2. Add a metadata entry to `assets/data/reports.json`.
3. Commit and push.

## Notes

- This build is static and does not call APIs.
- Upload controls are UI placeholders by design.
- Footer credit is included as requested.

## Pages CI troubleshooting

If a Pages deploy fails unexpectedly, inspect the artifact debug output in the workflow logs.

1. Open the failed workflow run in **Actions**.
2. Find the **Debug Pages artifacts for current run** step.
3. Check the printed summary:
   - total artifact count for the run
   - per-artifact name counts
4. If you see a warning about duplicate `github-pages` artifacts, trigger a new workflow run.

The deploy job now prints a specific warning when duplicate `github-pages` artifacts are detected, with a recommendation to re-run the workflow so a single fresh artifact is used.
