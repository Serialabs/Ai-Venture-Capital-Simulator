function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function textOrFallback(value) {
  if (typeof value === 'string' && value.trim()) {
    return escapeHtml(value);
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return escapeHtml(value);
  }
  return 'Not provided';
}

function listOrFallback(items, emptyLabel = 'Not provided') {
  if (!Array.isArray(items) || items.length === 0) {
    return `<li>${emptyLabel}</li>`;
  }

  return items.map((item) => `<li>${textOrFallback(item)}</li>`).join('');
}

async function loadReportManifest() {
  const response = await fetch('/assets/data/reports.json');
  if (!response.ok) {
    throw new Error('Unable to load report manifest.');
  }

  return response.json();
}

async function loadFullReportBySlug(slug) {
  const response = await fetch(`/assets/reports/${encodeURIComponent(slug)}.json`);
  if (!response.ok) {
    throw new Error(`Unable to load report content for "${slug}".`);
  }

  return response.json();
}

function renderPublishedReports(reports) {
  const mount = document.getElementById('published-reports-list');
  if (!mount) return;

  mount.innerHTML = reports.map((report) => `
    <article class="report-card">
      <div class="report-top">
        <h3>${textOrFallback(report.title)}</h3>
        <div class="report-meta">
          <span class="meta-chip">${textOrFallback(report.decision_label)}</span>
          <span class="meta-chip">${textOrFallback(report.confidence)}</span>
          <span class="meta-chip">${textOrFallback(report.reading_time)}</span>
        </div>
      </div>
      <p>${textOrFallback(report.summary)}</p>
      <div class="report-meta">
        ${(Array.isArray(report.tags) && report.tags.length > 0 ? report.tags : ['Not provided'])
          .map((tag) => `<span class="meta-chip">${textOrFallback(tag)}</span>`)
          .join('')}
        <span class="meta-chip">${textOrFallback(report.published_at)}</span>
      </div>
      <a class="report-link" href="/reports/${textOrFallback(report.slug)}.html">Read report →</a>
    </article>
  `).join('');
}

function renderKeyValueGrid(kv) {
  const entries = Object.entries(kv || {});
  if (entries.length === 0) {
    return '<li><strong>Not provided:</strong> Not provided</li>';
  }

  return entries
    .map(([key, value]) => `<li><strong>${textOrFallback(key)}:</strong> ${textOrFallback(value)}</li>`)
    .join('');
}

function renderReportPage(manifestItem, fullReport) {
  const main = document.querySelector('main[data-report-slug]');
  if (!main) return;

  const mount = main.querySelector('[data-report-root]') || main;

  const hero = fullReport?.hero || {};
  const evidence = fullReport?.evidence_summary || {};
  const stages = fullReport?.stages || {};
  const stage1 = stages.stage_1 || {};
  const stage2 = stages.stage_2 || {};
  const stage3 = stages.stage_3 || {};
  const stage4 = stages.stage_4 || {};

  mount.innerHTML = `
    <article>
      <p class="eyebrow">Published report • ${textOrFallback(hero.source)}</p>
      <h1>${textOrFallback(hero.title || manifestItem?.title)}</h1>
      <div class="report-meta-line">
        <span class="meta-chip">${textOrFallback(hero.date || manifestItem?.published_at)}</span>
        <span class="meta-chip">${textOrFallback(manifestItem?.decision_label || evidence.verdict)}</span>
        <span class="meta-chip">${textOrFallback(manifestItem?.confidence)}</span>
        <span class="meta-chip">${textOrFallback(manifestItem?.reading_time)}</span>
      </div>
      <p class="lede">${textOrFallback(hero.subtitle || manifestItem?.summary)}</p>

      <section class="report-section">
        <h2>Hero</h2>
        <ul>${listOrFallback(hero.chips)}</ul>
      </section>

      <section class="report-section">
        <h2>Evidence Summary</h2>
        <p><strong>Verdict:</strong> ${textOrFallback(evidence.verdict)}</p>
        ${(Array.isArray(evidence.cards) && evidence.cards.length > 0
          ? evidence.cards.map((card) => `
            <article>
              <h3>${textOrFallback(card.title)}</h3>
              <p>${textOrFallback(card.summary)}</p>
            </article>
          `).join('')
          : '<p>Not provided</p>')}
      </section>

      <section class="report-section">
        <h2>Stage 1</h2>
        <h3>Key Facts</h3>
        <ul>${renderKeyValueGrid(stage1.kv)}</ul>
        ${(Array.isArray(stage1.lists) && stage1.lists.length > 0
          ? stage1.lists.map((item) => `
            <h3>${textOrFallback(item.title)}</h3>
            <ul>${listOrFallback(item.items)}</ul>
          `).join('')
          : '<p>Not provided</p>')}
      </section>

      <section class="report-section">
        <h2>Stage 2</h2>
        ${(Array.isArray(stage2.personas) && stage2.personas.length > 0
          ? stage2.personas.map((persona) => `
            <article>
              <h3>${textOrFallback(persona.name)}</h3>
              <p>${textOrFallback(persona.summary)}</p>
              <ul>${listOrFallback(persona.signals)}</ul>
            </article>
          `).join('')
          : '<p>Not provided</p>')}
      </section>

      <section class="report-section">
        <h2>Stage 3</h2>
        ${(Array.isArray(stage3.rounds) && stage3.rounds.length > 0
          ? stage3.rounds.map((round) => `
            <article>
              <h3>${textOrFallback(round.title)}</h3>
              <p>${textOrFallback(round.summary)}</p>
              <ul>${listOrFallback(round.points)}</ul>
            </article>
          `).join('')
          : '<p>Not provided</p>')}
      </section>

      <section class="report-section">
        <h2>Stage 4</h2>
        <p>${textOrFallback(stage4.summary)}</p>
        <h3>Insights</h3>
        <ul>${listOrFallback(stage4.insights)}</ul>
        <h3>Questions</h3>
        <ul>${listOrFallback(stage4.questions)}</ul>
        <h3>Plans</h3>
        <ul>${listOrFallback(stage4.plans)}</ul>
        <h3>Checklist</h3>
        <ul>${listOrFallback(stage4.checklist)}</ul>
      </section>

      <section class="report-section">
        <h2>Epilogue</h2>
        <p>${textOrFallback(fullReport?.epilogue)}</p>
      </section>
    </article>
  `;
}

async function hydrateReportPage(reports) {
  const main = document.querySelector('main[data-report-slug]');
  if (!main) return;

  const slug = main.dataset.reportSlug;
  const manifestItem = Array.isArray(reports)
    ? reports.find((item) => item.slug === slug)
    : null;

  const mount = main.querySelector('[data-report-root]') || main;

  try {
    const fullReport = await loadFullReportBySlug(slug);
    renderReportPage(manifestItem, fullReport);
  } catch (error) {
    mount.innerHTML = `<article><p class="eyebrow">Unable to load report</p><p>${textOrFallback(error.message)}</p></article>`;
  }
}

(async () => {
  try {
    const reports = await loadReportManifest();
    renderPublishedReports(reports);
    await hydrateReportPage(reports);
  } catch (error) {
    const mount = document.getElementById('published-reports-list');
    if (mount) {
      mount.innerHTML = `<article class="report-card"><h3>Unable to load report feed</h3><p>${textOrFallback(error.message)}</p></article>`;
    }
  }
})();
