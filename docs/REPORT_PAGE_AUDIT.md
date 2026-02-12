# REPORT_PAGE_AUDIT

## Scope audited
- Template and concrete report-entry pages in `reports/`.
- Data hydration and rendering logic in `assets/report.js`.
- Shared report-related style system in `assets/css/styles.css`.
- Report JSON payload shape in `assets/reports/*.json`.

## 1) Full component inventory

### Global shell components (report pages)
1. **Sticky site header**
   - Markup: `.site-header > .container.nav-row > .brand + nav`.
   - Purpose: global navigation and brand identity.
2. **Main report container**
   - Markup: `.container.report-layout`.
   - Purpose: bounded content width and report spacing.
3. **Report mount/root**
   - Markup: `article[data-report-slug][data-report-root]`.
   - Purpose: report page hydration root and slug source.
4. **Footer**
   - Markup: `.site-footer` and nested content.
   - Purpose: legal/attribution copy.

### Report-detail page (runtime/data-driven) components
5. **Loading state text**
   - Initial placeholder: `.eyebrow` with “Loading report…”.
6. **Report meta line mount**
   - Markup: `[data-report-meta]`.
   - Hydrated chips: published date, decision label, confidence, reading time.
7. **Meta chips**
   - Class: `.meta-chip`.
   - Role: compact, repeatable semantic tags.
8. **Report cards (list context + fallback states)**
   - Class: `.report-card`.
   - Used in published report list and fetch-failure fallback.
9. **Report section cards**
   - Class: `.report-section`.
   - Semantic block for sectioned prose/evidence.
10. **Optional dynamic-report family**
    - Classes present in CSS: `.dynamic-report*`, `.verdict-strip*`, `.report-error`.
    - Indicates planned/legacy higher-fidelity report composition primitives.

### Data components (content model inferred from payloads)
11. **Hero block** (`hero.title/subtitle/date/source/chips`).
12. **Evidence summary** (`evidence_summary.cards[] + verdict`).
13. **Stage blocks** (`stages.stage_1..stage_4`, with typed structures).
14. **Persona cards** (`stage_2.personas[]`).
15. **IC rounds timeline** (`stage_3.rounds[]`).
16. **Final synthesis/checklist** (`stage_4.summary/insights/questions/plans/checklist`).

## 2) Trigger map

### Current implemented runtime triggers
1. **Page load (IIFE boot in `report.js`)**
   - Trigger: script evaluation at document end.
   - Effects:
     - Fetch report manifest (`../assets/data/reports.json`).
     - Render published report list if `#published-reports-list` exists.
     - Hydrate single report metadata if `[data-report-slug]` + `[data-report-meta]` exist.
2. **Fetch success path**
   - Trigger: `response.ok` true.
   - Effect: JSON parsing and DOM insertion via `.innerHTML`.
3. **Fetch failure path**
   - Trigger: network/HTTP error.
   - Effect: fallback error card rendered into published list mount.

### Styling/scroll behavior triggers (global style primitives)
4. **Sticky header activation**
   - Trigger: document scroll.
   - Effect: `.site-header` remains pinned with blur and border.
5. **Responsive breakpoint at `max-width: 900px`**
   - Trigger: viewport width change.
   - Effect: grid/layout collapse to single-column patterns.

### Potential/anticipated triggers (not yet active on report page)
6. **Reveal-on-scroll classes**
   - `.reveal` / `.is-visible` pattern exists in main app JS, suitable for report animation adoption.
7. **Verdict state class switching**
   - `.verdict-strip.invest|dig-deeper|pass` supports data-driven visual mode changes.

## 3) DOM and styling patterns

### DOM patterns
- **Data-attribute mount strategy**: `data-report-slug`, `data-report-root`, `data-report-meta` for selective hydration.
- **Optional mount behavior**: functions no-op cleanly when mount nodes are absent.
- **String-template render flow**: repeaters (`map().join('')`) and chip lists rendered through HTML strings.
- **Semantic + utility class mix**: semantic wrappers (`report-layout`) plus reusable atoms (`meta-chip`).

### Styling patterns
- **Design-token variables in `:root`** for colors, spacing, radius.
- **Card-first visual grammar** with bordered surfaces and rounded corners.
- **Chip system** for metadata density and consistent information hierarchy.
- **Sticky affordances** (`.site-header`, `.anchor-nav`, `.dynamic-report__toc`).
- **Mobile-first adaptation through limited breakpoint set** (single major breakpoint).
- **State modifiers** via class composition (e.g., `.verdict-strip.pass`).

## 4) Interaction and state list

### Existing interaction states
1. **Report list mount absent/present**
   - `renderPublishedReports` exits early if no target mount.
2. **Report page mount absent/present**
   - `hydrateReportPage` exits early if no slug root.
3. **Report lookup success/failure**
   - If slug not found or meta mount absent, hydration is skipped.
4. **Network success/failure**
   - Errors handled with user-visible fallback card on list pages.

### User-visible states on report detail page
5. **Initial loading placeholder** (`Loading report…` eyebrow text).
6. **Hydrated metadata chips** when slug/meta mapping succeeds.
7. **Static authored prose remains available** regardless of hydration result.

### Accessibility and motion states (current baseline)
8. **No explicit reduced-motion branch** currently on report page.
9. **No keyboard-only special states** beyond native link focus handling.
10. **No animated state transitions currently defined for report detail components.**

## Audit conclusions
- The current report detail architecture is intentionally lightweight and resilient (safe no-op mounts, minimal required data).
- CSS already contains a richer report component vocabulary than currently exercised by the report-page runtime.
- This creates a strong foundation for a phased animation rollout that can begin with non-blocking, observer-triggered entrance effects while preserving static readability.
