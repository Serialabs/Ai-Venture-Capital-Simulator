# INCIDENT_NOTES

## GitHub Pages deployment triage

- Known failure signature to watch for:
  - `Multiple artifacts named "github-pages" were unexpectedly found`
- Recovery guidance:
  - Do not re-run the same failed workflow run if artifact upload already completed.
  - Trigger a fresh run via `workflow_dispatch` or by pushing a new commit.
