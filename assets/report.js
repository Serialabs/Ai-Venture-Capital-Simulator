async function loadReportManifest() {
  const response = await fetch('../assets/data/reports.json');
  if (!response.ok) {
    throw new Error('Unable to load report manifest.');
  }
  return response.json();
}

function renderPublishedReports(reports) {
  const mount = document.getElementById('published-reports-list');
  if (!mount) return;

  mount.innerHTML = reports.map((report) => `
    <article class="report-card">
      <div class="report-top">
        <h3>${report.title}</h3>
        <div class="report-meta">
          <span class="meta-chip">${report.decision_label}</span>
          <span class="meta-chip">${report.confidence}</span>
          <span class="meta-chip">${report.reading_time}</span>
        </div>
      </div>
      <p>${report.summary}</p>
      <div class="report-meta">
        ${(report.tags || []).map((tag) => `<span class="meta-chip">${tag}</span>`).join('')}
        <span class="meta-chip">${report.published_at}</span>
      </div>
      <a class="report-link" href="/reports/${report.slug}.html">Read report →</a>
    </article>
  `).join('');
}

function hydrateReportPage(reports) {
  const root = document.querySelector('[data-report-slug]');
  if (!root) return;

  const slug = root.dataset.reportSlug;
  const report = reports.find((item) => item.slug === slug);
  const meta = document.querySelector('[data-report-meta]');

  if (!report || !meta) return;

  meta.innerHTML = `
    <span class="meta-chip">${report.published_at}</span>
    <span class="meta-chip">${report.decision_label}</span>
    <span class="meta-chip">${report.confidence}</span>
    <span class="meta-chip">${report.reading_time}</span>
  `;
}

function createReportRenderer() {
  let activeReportElement = null;
  const state = {
    jsonLoadState: 'idle',
    activeSection: 'n/a',
    progress: 0,
    countersRunning: false,
    counterValues: [],
  };

  const listeners = new Set();

  function emitStatus() {
    listeners.forEach((listener) => listener({ ...state }));
  }

  function onStatusChange(listener) {
    listeners.add(listener);
    listener({ ...state });
    return () => listeners.delete(listener);
  }

  function setJsonLoadState(value) {
    state.jsonLoadState = value;
    emitStatus();
  }

  function setActiveReportElement(el) {
    activeReportElement = el;
    updateScrollState();
  }

  function setReducedMotionSimulation(enabled) {
    document.documentElement.classList.toggle('reduced-motion-sim', Boolean(enabled));
  }

  function queryActive(selector) {
    return activeReportElement ? Array.from(activeReportElement.querySelectorAll(selector)) : [];
  }

  function resetReveals() {
    queryActive('[data-reveal]').forEach((node) => node.classList.remove('is-revealed'));
  }

  function forceReveal() {
    queryActive('[data-reveal]').forEach((node) => node.classList.add('is-revealed'));
  }

  function setPersonasExpanded(expanded) {
    queryActive('[data-persona-details]').forEach((node) => {
      node.open = Boolean(expanded);
    });
  }

  function setRoundsExpanded(expanded) {
    queryActive('[data-round-details]').forEach((node) => {
      node.open = Boolean(expanded);
    });
  }

  function startCounters() {
    const counters = queryActive('[data-counter-target]');
    if (!counters.length) {
      state.countersRunning = false;
      state.counterValues = [];
      emitStatus();
      return;
    }

    state.countersRunning = true;
    state.counterValues = counters.map(() => 0);
    emitStatus();

    const startedAt = performance.now();
    const durationMs = document.documentElement.classList.contains('reduced-motion-sim') ? 50 : 900;

    function tick(now) {
      const ratio = Math.min(1, (now - startedAt) / durationMs);
      counters.forEach((counterNode, index) => {
        const target = Number(counterNode.dataset.counterTarget || 0);
        const value = Math.round(target * ratio);
        counterNode.textContent = String(value);
        state.counterValues[index] = value;
      });
      emitStatus();
      if (ratio < 1) {
        requestAnimationFrame(tick);
      } else {
        state.countersRunning = false;
        emitStatus();
      }
    }

    requestAnimationFrame(tick);
  }

  function updateScrollState() {
    if (!activeReportElement) return;
    const sections = queryActive('[data-scrollspy-section]');
    if (!sections.length) return;

    const viewportLine = window.scrollY + 120;
    let active = sections[0];
    sections.forEach((section) => {
      if (section.offsetTop <= viewportLine) {
        active = section;
      }
    });
    state.activeSection = active.dataset.scrollspySection || active.id || 'n/a';

    const top = activeReportElement.offsetTop;
    const total = Math.max(activeReportElement.scrollHeight - window.innerHeight, 1);
    const progressed = Math.max(0, Math.min(window.scrollY - top, total));
    state.progress = Math.round((progressed / total) * 100);
    emitStatus();
  }

  window.addEventListener('scroll', updateScrollState, { passive: true });

  function renderInteractiveReport(mount, data) {
    if (!mount || !data) return;

    mount.innerHTML = `
      <article class="dev-report" data-report-shell>
        <header class="dev-report-hero" data-scrollspy-section="hero">
          <p class="eyebrow">${data.hero.date} · ${data.hero.source}</p>
          <h2>${data.hero.title}</h2>
          <p>${data.hero.subtitle}</p>
          <div class="chip-row">${(data.hero.chips || []).map((chip) => `<span class="meta-chip">${chip}</span>`).join('')}</div>
        </header>

        <section data-scrollspy-section="summary" data-reveal>
          <h3>Evidence Summary</h3>
          <div class="counter-row">
            <div class="counter-card"><span data-counter-target="${(data.evidence_summary.cards || []).length}">0</span><small>Cards</small></div>
            <div class="counter-card"><span data-counter-target="${(data.stages.stage_2.personas || []).length}">0</span><small>Personas</small></div>
            <div class="counter-card"><span data-counter-target="${(data.stages.stage_3.rounds || []).length}">0</span><small>Rounds</small></div>
          </div>
          <div class="card-grid">
            ${(data.evidence_summary.cards || []).map((card) => `<article class="report-card"><h4>${card.title}</h4><p>${card.summary}</p></article>`).join('')}
          </div>
        </section>

        <section data-scrollspy-section="personas" data-reveal>
          <h3>Personas</h3>
          ${(data.stages.stage_2.personas || []).map((persona) => `
            <details data-persona-details>
              <summary>${persona.name}</summary>
              <p>${persona.summary}</p>
              <ul>${(persona.signals || []).map((signal) => `<li>${signal}</li>`).join('')}</ul>
            </details>
          `).join('')}
        </section>

        <section data-scrollspy-section="rounds" data-reveal>
          <h3>IC Rounds</h3>
          ${(data.stages.stage_3.rounds || []).map((round) => `
            <details data-round-details>
              <summary>${round.title}</summary>
              <p>${round.summary}</p>
              <ul>${(round.points || []).map((point) => `<li>${point}</li>`).join('')}</ul>
            </details>
          `).join('')}
        </section>
      </article>
    `;

    setActiveReportElement(mount.querySelector('[data-report-shell]'));
    forceReveal();
    updateScrollState();
  }

  async function loadReportJson(path) {
    setJsonLoadState('loading');
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load ${path}`);
      }
      const data = await response.json();
      setJsonLoadState('loaded');
      return data;
    } catch (error) {
      setJsonLoadState('error');
      throw error;
    }
  }

  return {
    loadReportJson,
    onStatusChange,
    renderInteractiveReport,
    setActiveReportElement,
    setReducedMotionSimulation,
    resetReveals,
    forceReveal,
    setPersonasExpanded,
    setRoundsExpanded,
    startCounters,
    updateScrollState,
  };
}

window.ReportRenderer = window.ReportRenderer || createReportRenderer();

(async () => {
  try {
    const reports = await loadReportManifest();
    renderPublishedReports(reports);
    hydrateReportPage(reports);
  } catch (error) {
    const mount = document.getElementById('published-reports-list');
    if (mount) {
      mount.innerHTML = `<article class="report-card"><h3>Unable to load report feed</h3><p>${error.message}</p></article>`;
    }
  }
})();
