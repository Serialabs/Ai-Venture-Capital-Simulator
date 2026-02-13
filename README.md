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
