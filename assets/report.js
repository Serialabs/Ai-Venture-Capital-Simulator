(async function initReport() {
  const root = document.querySelector('[data-report-root]');
  if (!root) return;

  const data = await fetch('assets/mock-youtube-2005.json').then((r) => r.json());
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const bind = (selector, value) => {
    const node = document.querySelector(`[data-bind="${selector}"]`);
    if (node) node.textContent = value;
  };

  bind('hero.kicker', data.hero.kicker);
  bind('hero.title', data.hero.title);
  bind('meta.subtitle', data.meta.subtitle);
  bind('hero.subline', data.hero.subline);

  const metrics = document.querySelector('[data-hero-metrics]');
  data.hero.metrics.forEach((m) => metrics.insertAdjacentHTML('beforeend', `<span class="chip">${m}</span>`));

  const ctas = document.querySelector('[data-hero-ctas]');
  data.hero.ctas.forEach((c, i) => {
    ctas.insertAdjacentHTML('beforeend', `<a class="btn ${i ? 'ghost' : ''}" href="${c.href}">${c.label}</a>`);
  });

  const renderCards = (target, items, fn) => {
    const el = document.querySelector(target);
    items.forEach((item, i) => el.insertAdjacentHTML('beforeend', fn(item, i)));
  };

  renderCards('[data-deal-memo-cards]', data.dealMemoCards, (c) =>
    `<article class="panel reveal"><p class="pill">${c.title}</p><h3>${c.heading}</h3><p>${c.body}</p></article>`);

  renderCards('[data-market-stats]', data.marketStats, (s) =>
    `<div class="stat reveal" data-counter="${s.value}" data-unit="${s.unit}"><strong>0</strong><span>${s.label}<br>${s.sublabel}</span></div>`);

  renderCards('[data-team-cards]', data.team, (t) =>
    `<article class="panel reveal"><h4>${t.name}</h4><p class="pill">${t.role}</p><p>${t.bio}</p></article>`);

  document.querySelector('[data-competition]').innerHTML = `<h3>Competition Snapshot</h3><p>${data.competition.body}</p>`;

  renderCards('[data-spotlight]', data.spotlight, (s) =>
    `<article class="panel reveal"><p class="pill">${s.label}</p><h4>${s.name}</h4><p>${s.rationale}</p></article>`);

  renderCards('[data-evaluations]', data.evaluations, (e, i) => `
    <article class="panel reveal">
      <div class="eval-head">
        <button aria-expanded="false" aria-controls="eval-${i}" data-toggle="#eval-${i}">${e.name} · ${e.tagline}</button>
        <span class="verdict ${e.verdict === 'INVEST' ? 'invest' : e.verdict === 'PASS' ? 'pass' : 'dig'}">${e.verdict}</span>
      </div>
      <div class="hidden-body" id="eval-${i}">
        <div class="cols">
          <div><strong>Strengths</strong><ul>${e.strengths.map((x) => `<li>${x}</li>`).join('')}</ul></div>
          <div><strong>Concerns</strong><ul>${e.concerns.map((x) => `<li>${x}</li>`).join('')}</ul></div>
        </div>
        <blockquote>${e.quote}</blockquote>
      </div>
    </article>`);

  renderCards('[data-debate-rounds]', data.debateRounds, (r, i) => `
    <article class="panel reveal">
      <button class="accordion-btn" aria-expanded="false" aria-controls="round-${i}" data-toggle="#round-${i}">
        <span class="idx">${String(i + 1).padStart(2, '0')}</span><strong>${r.roundTitle}</strong>
      </button>
      <div class="accordion-panel" id="round-${i}">
        <p>${r.summary}</p>
        ${r.turns.map((t) => `<div class="turn"><span class="name-chip">${t.speaker}</span>${t.text}</div>`).join('')}
        ${r.callouts.map((c) => `<p class="callout">• ${c}</p>`).join('')}
      </div>
    </article>`);

  renderCards('[data-key-insights]', data.finalReport.insights, (ins, i) =>
    `<article class="panel reveal"><h4>${i + 1}. ${ins.title}</h4><p>${ins.body}</p></article>`);

  renderCards('[data-founder-questions]', data.finalReport.founderQuestions, (group) =>
    `<article class="panel reveal"><h4>${group.persona}</h4><ul>${group.questions.map((q) => `<li>${q}</li>`).join('')}</ul></article>`);

  renderCards('[data-action-plans]', data.finalReport.actionPlans, (group) =>
    `<article class="panel reveal"><h4>${group.persona}</h4><ul>${group.actions.map((a) => `<li>${a}</li>`).join('')}</ul></article>`);

  document.querySelector('[data-exec-summary]').innerHTML = `<h3>Executive Summary</h3>${data.finalReport.execSummary.map((p) => `<p>${p}</p>`).join('')}`;
  document.querySelector('[data-epilogue]').innerHTML = `<h3>Epilogue</h3><p class="big-metric">${data.finalReport.epilogueMetric.value}</p><p>${data.finalReport.epilogueMetric.detail}</p><div class="fade-line"></div>`;

  renderCards('[data-debate-triggers]', data.debateTriggers, (d, i) => `
    <div class="accordion-item reveal">
      <button class="accordion-btn" aria-expanded="false" aria-controls="trigger-${i}" data-toggle="#trigger-${i}">
        <span class="idx">${String(d.id).padStart(2, '0')}</span><span>${d.title}</span>
      </button>
      <div class="accordion-panel" id="trigger-${i}"><p>${d.detail}</p></div>
    </div>`);

  document.querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = document.querySelector(btn.dataset.toggle);
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.style.maxHeight = open ? '0px' : `${panel.scrollHeight}px`;
    });
  });

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll('[data-reveal], .reveal').forEach((el, i) => {
    if (reduced) return el.classList.add('in');
    el.style.transitionDelay = `${Math.min(i * 35, 280)}ms`;
    sectionObserver.observe(el);
  });

  const countUp = (el) => {
    const end = Number(el.dataset.counter);
    const unit = el.dataset.unit || '';
    if (reduced) {
      el.querySelector('strong').textContent = `${end}${unit}`;
      return;
    }
    let start = null;
    const duration = 1150;
    const step = (ts) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      el.querySelector('strong').textContent = `${Math.floor(end * t)}${unit}`;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-counter]').forEach((el) => counterObserver.observe(el));

  const navLinks = [...document.querySelectorAll('[data-nav-link]')];
  const sections = [...document.querySelectorAll('[data-section]')];
  const setActive = (id) => navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0.01 });
  sections.forEach((s) => navObserver.observe(s));
})();
