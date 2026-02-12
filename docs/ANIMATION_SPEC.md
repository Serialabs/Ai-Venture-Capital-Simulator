# ANIMATION_SPEC

## Goals
- Add polished, low-risk motion to report pages without blocking content access.
- Keep animation opt-in and progressive: content must remain readable with JS disabled or motion disabled.
- Use **IntersectionObserver-first** reveal orchestration to avoid scroll handlers and minimize main-thread work.

## Motion tokens
- **Durations**
  - `--motion-fast`: 140ms
  - `--motion-base`: 220ms
  - `--motion-slow`: 320ms
- **Easings**
  - Enter: `cubic-bezier(0.22, 1, 0.36, 1)`
  - Emphasis: `cubic-bezier(0.2, 0.8, 0.2, 1)`
  - Exit (if used later): `cubic-bezier(0.4, 0, 1, 1)`
- **Distance**
  - Vertical reveal offset: 10–16px max
  - Scale micro-emphasis: 0.985 -> 1
- **Stagger baseline**
  - 30ms between siblings (capped at 180ms total extra delay)

## Per-component spec (trigger / effect / timing / easing / stagger)

1. **Header (`.site-header`)**
   - Trigger: first paint.
   - Effect: subtle fade-in only (no slide to preserve stability).
   - Timing/easing: 160ms / enter easing.
   - Stagger: none.

2. **Report hero wrapper (`article[data-report-root]` top block)**
   - Trigger: first paint.
   - Effect: fade + translateY(12px -> 0).
   - Timing/easing: 240ms / enter easing.
   - Stagger: none.

3. **Meta chips (`.meta-chip`)**
   - Trigger: parent block visible/hydrated.
   - Effect: fade + translateY(6px -> 0).
   - Timing/easing: 180ms / emphasis easing.
   - Stagger: 30ms per chip.

4. **Section cards (`.report-section`, `.report-card`)**
   - Trigger: IntersectionObserver threshold crossed (0.16).
   - Effect: fade + translateY(14px -> 0).
   - Timing/easing: 240ms / enter easing.
   - Stagger: 40ms per sibling in same group.

5. **Evidence rows / list items (`li`, persona/round rows when rendered)**
   - Trigger: parent section enters viewport.
   - Effect: fade-only (avoid excessive motion in dense text).
   - Timing/easing: 160ms / emphasis easing.
   - Stagger: 20ms.

6. **Verdict strip (`.verdict-strip.*`)**
   - Trigger: verdict class applied/updated.
   - Effect: micro-scale (0.985 -> 1) + background-color transition.
   - Timing/easing: 200ms / emphasis easing.
   - Stagger: none.

7. **Error state (`.report-error`)**
   - Trigger: error mount insertion.
   - Effect: fade-in only.
   - Timing/easing: 140ms / linear or emphasis.
   - Stagger: none.

## Reduced-motion behavior
- Honor `@media (prefers-reduced-motion: reduce)`.
- In reduced mode:
  - Remove transforms and stagger delays.
  - Keep optional opacity transition <= 80ms, or fully disable.
  - Force all reveal targets visible immediately (`.is-visible` equivalent).
- JS fallback:
  - If reduced motion is detected, skip observer setup and apply final state classes at once.

## Performance notes (IntersectionObserver-first)
1. **No scroll listeners for reveal logic**.
2. **Single observer instance** reused for all reveal targets.
3. **Observe once, then unobserve after first intersection**.
4. **Animate only `opacity` + `transform`** (GPU-friendly; avoid layout-triggering props).
5. **Cap simultaneous stagger groups** to prevent long reveal queues.
6. **Avoid large box-shadow animation**; keep static shadows.
7. **Hydration first, animation second**: insert content, then next-frame add reveal classes.
8. **Graceful fallback** when `IntersectionObserver` unavailable: immediate visible state.

## Acceptance criteria
1. All report content remains readable with JS disabled.
2. With JS enabled, section cards reveal on first viewport entry with no visible jank.
3. Reduced-motion users observe either no movement or minimal non-positional fades.
4. Lighthouse/Performance profile shows no long tasks attributable to animation setup.
5. No CLS regressions introduced by motion classes.
6. Error and loading states remain functionally equivalent and understandable.
7. Mobile viewport behavior matches desktop intent with reduced offsets and same durations.
