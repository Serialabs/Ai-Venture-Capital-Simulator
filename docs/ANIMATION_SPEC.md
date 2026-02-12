# Animation Spec — Live `youtube-2005.html`

## Source of truth
This spec is derived from runtime CSSOM + JS inspection of the deployed page at:
`https://ianparkvc.github.io/aivc/youtube-2005.html`.

## Global motion behavior
- `html { scroll-behavior: smooth; }` enables smooth anchor scrolling for in-page nav hash links.
- Reveal-on-scroll is implemented with IntersectionObserver + class toggling.

## Component-level motion catalog

| Component / selector | Timing | Easing | Trigger | Property changes | Notes |
|---|---:|---|---|---|---|
| `.hero-content` | `1s` | `ease-out` | Initial render (CSS `animation`) | `opacity` 0→1, `transform: translateY(30px)→0` via `@keyframes fadeUp` | One-shot entrance animation. |
| `.nav-links a` | `0.2s` | browser default for shorthand transition | Hover/focus/interaction | Color/background interpolation | No persistent active-scrollspy state. |
| `.memo-card` | `0.3s` | browser default | Hover | Border color change + `transform: translateY(-2px)` | Micro-lift affordance. |
| `.vc-eval` | `0.3s` | browser default | Hover | Border color change | No transform on hover. |
| `.fade-in` class family | `0.6s` for `opacity`, `0.6s` for `transform` | browser default | JS adds `.visible` when observer crosses threshold | Opacity and vertical transform settle in | Applied to memo/eval/debate/insight/action/team/trigger cards. |

## JS-triggered reveal spec

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.memo-card, .vc-eval, .debate-speaker, .insight-card, .action-plan, .team-card, .trigger-item').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});
```

### Behavioral interpretation
- Threshold = **0.1** means reveal occurs when roughly 10% of target enters viewport.
- Reveal is **one-way** in current implementation (`visible` is added, never removed).
- At top of page, many reveal targets remain hidden until user scroll reaches them.

## Non-existent / not implemented interactions
- No expand/collapse state machine (no `details`, no `aria-expanded` controls).
- No timeline scrubber/progress indicator animation logic in JS.
