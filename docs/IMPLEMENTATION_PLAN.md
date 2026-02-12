# IMPLEMENTATION_PLAN

## Decision: framework path
**Chosen path: Vanilla HTML/CSS/JS enhancement (no React/Vite/TypeScript migration for this phase).**

### Justification (3 reasons)
1. **Current architecture is already static-first and data-hydrated**
   - Report pages are authored HTML with lightweight JS hydration (`assets/report.js`), so animation can be layered in with minimal churn.
2. **Lower migration risk and faster delivery**
   - A React/Vite/TS migration would change routing, build/deploy flow, and runtime assumptions before solving the immediate motion objective.
3. **Operational simplicity for GitHub Pages/static hosting**
   - Existing project structure appears optimized for direct static deployment; preserving this reduces CI/CD and artifact complexity.

## Fallback path
If animation scope expands into high-frequency stateful interactions (filtering, virtualized sections, component composition at scale), move to:
- **React + Vite + TypeScript** with incremental adoption.
- Start with report detail pages only (island/app mount in `reports/*.html`), leaving marketing/static pages untouched.

## Implementation phases

### Phase 0 — Baseline hardening
- Add explicit motion utility classes in stylesheet (`.reveal`, `.fade-up`, `.is-visible`).
- Confirm no regressions for pages without reveal targets.

### Phase 1 — Observer-driven entrances
- Extend `assets/report.js` with `setupRevealOnScroll` (or shared utility extraction).
- Apply reveal classes to report sections/cards/chips post-hydration.
- Unobserve elements after first intersection.

### Phase 2 — Reduced-motion & accessibility
- Add `prefers-reduced-motion` CSS branch and JS bypass.
- Validate keyboard navigation and focus visibility unaffected by animation classes.

### Phase 3 — QA and tuning
- Test desktop/mobile timing and staggering limits.
- Validate performance in DevTools (no long tasks from observer/DOM writes).
- Tune thresholds and offsets based on readability.

## Data schema specification

### Existing manifest schema (required)
```json
{
  "reports": [
    {
      "slug": "string",
      "title": "string",
      "subtitle": "string",
      "description": "string",
      "verdicts": {
        "bull": "INVEST|DIG_DEEPER|PASS",
        "bear": "INVEST|DIG_DEEPER|PASS",
        "wild": "INVEST|DIG_DEEPER|PASS"
      },
      "tags": ["string"],
      "date": "YYYY-MM-DD"
    }
  ]
}
```

### Report detail payload schema (current/target)
```json
{
  "hero": {
    "title": "string",
    "subtitle": "string",
    "date": "YYYY-MM-DD",
    "source": "string",
    "chips": ["string"]
  },
  "evidence_summary": {
    "cards": [{ "title": "string", "summary": "string" }],
    "verdict": "INVEST|DIG_DEEPER|PASS"
  },
  "stages": {
    "stage_1": {
      "kv": { "string": "string" },
      "lists": [{ "title": "string", "items": ["string"] }]
    },
    "stage_2": {
      "personas": [{ "name": "string", "summary": "string", "signals": ["string"] }]
    },
    "stage_3": {
      "rounds": [{ "title": "string", "summary": "string", "points": ["string"] }]
    },
    "stage_4": {
      "summary": "string",
      "insights": ["string"],
      "questions": ["string"],
      "plans": ["string"],
      "checklist": ["string"]
    }
  }
}
```

## Directory structure

### Current (relevant)
- `reports/*.html` — per-report entry pages.
- `assets/report.js` — report hydration logic.
- `assets/css/styles.css` — shared site and report styles.
- `assets/data/reports.json` — report manifest.
- `assets/reports/*.json` — detailed report payloads.

### Planned additions/organization
- `docs/REPORT_PAGE_AUDIT.md`
- `docs/ANIMATION_SPEC.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/CONFIDENCE_LEDGER.md`
- `docs/QA_CHECKLIST.md`

Optional next-step (if refactoring utilities):
- `assets/js/utils/reveal.js` — reusable IntersectionObserver reveal helper.
