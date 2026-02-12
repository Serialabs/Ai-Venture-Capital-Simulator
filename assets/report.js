function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asText(value, fallback = 'N/A') {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function verdictClass(verdict) {
  const normalized = asText(verdict, 'dig-deeper').toLowerCase();
  if (normalized.includes('invest')) return 'invest';
  if (normalized.includes('pass')) return 'pass';
  return 'dig-deeper';
}

function splitParagraphs(content) {
  return String(content ?? '')
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

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

  mount.innerHTML = asArray(reports).map((report) => `
    <article class="report-card">
      <div class="report-top">
        <h3>${escapeHtml(asText(report.title, 'Untitled report'))}</h3>
        <div class="report-meta">
          <span class="meta-chip">${escapeHtml(asText(report.decision_label))}</span>
          <span class="meta-chip">${escapeHtml(asText(report.confidence))}</span>
          <span class="meta-chip">${escapeHtml(asText(report.reading_time))}</span>
        </div>
      </div>
      <p>${escapeHtml(asText(report.summary, 'Summary unavailable.'))}</p>
      <div class="report-meta">
        ${asArray(report.tags).map((tag) => `<span class="meta-chip">${escapeHtml(asText(tag, 'Tag'))}</span>`).join('')}
        <span class="meta-chip">${escapeHtml(asText(report.published_at))}</span>
      </div>
      <a class="report-link" href="/reports/${encodeURIComponent(asText(report.slug, 'unknown'))}.html">Read report →</a>
    </article>
  `).join('');
}

function hydrateReportPage(reports) {
  const root = document.querySelector('[data-report-slug]:not([data-report-root])');
  if (!root) return;

  const slug = root.dataset.reportSlug;
  const report = asArray(reports).find((item) => item.slug === slug);
  const meta = document.querySelector('[data-report-meta]');

  if (!report || !meta) return;

  meta.innerHTML = `
    <span class="meta-chip">${escapeHtml(asText(report.published_at))}</span>
    <span class="meta-chip">${escapeHtml(asText(report.decision_label))}</span>
    <span class="meta-chip">${escapeHtml(asText(report.confidence))}</span>
    <span class="meta-chip">${escapeHtml(asText(report.reading_time))}</span>
  `;
}

async function copyText(text, button) {
  const label = button?.dataset?.label || 'Copy';
  try {
    await navigator.clipboard.writeText(text);
    if (button) {
      button.textContent = 'Copied';
      setTimeout(() => {
        button.textContent = label;
      }, 1400);
    }
  } catch (_error) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', 'readonly');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    document.body.removeChild(area);
    if (button) {
      button.textContent = 'Copied*';
      setTimeout(() => {
        button.textContent = label;
      }, 1400);
    }
  }
}

function buildDynamicReportMarkup(report, slug) {
  const hero = report?.hero || {};
  const evidenceSummary = report?.evidence_summary || {};
  const stages = report?.stages || {};
  const chips = asArray(hero.chips).filter((chip) => asText(chip, '').trim());
  const overflowChips = asArray(hero.chips_overflow).filter((chip) => asText(chip, '').trim());
  const stage1 = stages.stage_1 || {};
  const stage2 = stages.stage_2 || {};
  const stage3 = stages.stage_3 || {};
  const stage4 = stages.stage_4 || {};

  const kvEntries = Object.entries(stage1.kv || {}).filter(([, value]) => asText(value, '').trim());
  const stage1Lists = asArray(stage1.lists);
  const stage1Triggers = asArray(stage1.triggers).filter((item) => asText(item, '').trim());

  const personaCards = asArray(stage2.personas).map((persona, index) => {
    const name = asText(persona?.name, `Unknown persona #${index + 1}`);
    const summary = asText(persona?.summary, 'No summary provided.');
    const signals = asArray(persona?.signals).filter((item) => asText(item, '').trim());
    const verdict = asText(persona?.verdict, 'Dig Deeper');
    const confidence = asText(persona?.confidence, 'Unstated confidence');

    return `
      <details class="report-section">
        <summary>${escapeHtml(name)}</summary>
        <p>${escapeHtml(summary)}</p>
        <p><strong>Verdict:</strong> ${escapeHtml(verdict)} · <strong>Confidence:</strong> ${escapeHtml(confidence)}</p>
        <ul>${signals.length ? signals.map((signal) => `<li>${escapeHtml(asText(signal))}</li>`).join('') : '<li>No signals provided.</li>'}</ul>
      </details>
    `;
  }).join('') || '<p class="report-error">No persona records found for Stage 2.</p>';

  const roundsMarkup = asArray(stage3.rounds).map((round, index) => {
    const title = asText(round?.title, `Round ${index + 1}`);
    const summary = asText(round?.summary, 'No summary provided.');
    const points = asArray(round?.points).filter((item) => asText(item, '').trim());
    const roleContent = splitParagraphs(round?.role_content || round?.content).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');

    return `
      <details class="report-section">
        <summary>${escapeHtml(title)}</summary>
        <p>${escapeHtml(summary)}</p>
        ${points.length ? `<ul>${points.map((point) => `<li>${escapeHtml(asText(point))}</li>`).join('')}</ul>` : '<p class="evidence">No bullet points provided.</p>'}
        ${roleContent || '<p class="evidence">No role dialogue provided.</p>'}
      </details>
    `;
  }).join('') || '<p class="report-error">No rounds provided for Stage 3.</p>';

  const safeReportJson = JSON.stringify(report, null, 2);

  return `
    <section class="dynamic-report">
      <p class="eyebrow">Published report</p>
      <div class="dynamic-report__hero">
        <div>
          <h1>${escapeHtml(asText(hero.title, `${slug} report`))}</h1>
          <p class="lede">${escapeHtml(asText(hero.subtitle, 'No subtitle provided.'))}</p>
          <div class="report-meta">
            <span class="meta-chip">${escapeHtml(asText(hero.date, 'Date unknown'))}</span>
            <span class="meta-chip">${escapeHtml(asText(hero.source, 'Source unknown'))}</span>
            <span class="meta-chip">${escapeHtml(asText(slug, 'unknown-slug'))}</span>
          </div>
          <div class="chips-grid">
            ${((chips.length ? chips : []).concat(overflowChips)).length ? ((chips.length ? chips : []).concat(overflowChips)).map((chip) => `<span class="chip">${escapeHtml(asText(chip))}</span>`).join('') : '<span class="chip">No chips provided</span>'}
          </div>
          <div class="verdict-strip ${verdictClass(evidenceSummary.verdict)}">
            <strong>Verdict:</strong> ${escapeHtml(asText(evidenceSummary.verdict, 'DIG DEEPER'))}
          </div>
        </div>
        <div class="dynamic-report__actions">
          <button class="btn secondary" type="button" data-copy-json data-label="Copy JSON">Copy JSON</button>
          <button class="btn secondary" type="button" data-copy-summary data-label="Copy Summary">Copy Summary</button>
        </div>
      </div>

      <nav class="dynamic-report__toc" aria-label="Report sections">
        <a href="#stage-1">Stage 1</a>
        <a href="#stage-2">Stage 2</a>
        <a href="#stage-3">Stage 3</a>
        <a href="#stage-4">Stage 4</a>
        <a href="#epilogue">Epilogue</a>
      </nav>

      <section id="stage-1" class="report-section">
        <h2>Stage 1 — Memo extraction</h2>
        ${kvEntries.length ? `<div class="cards three-up">${kvEntries.map(([key, value]) => `<article class="card"><h3>${escapeHtml(key)}</h3><p>${escapeHtml(asText(value))}</p></article>`).join('')}</div>` : '<p class="report-error">Stage 1 key-value summary is missing.</p>'}
        ${stage1Lists.length ? stage1Lists.map((list) => `<article class="card"><h3>${escapeHtml(asText(list?.title, 'Untitled list'))}</h3><ul>${asArray(list?.items).map((item) => `<li>${escapeHtml(asText(item, 'Missing item'))}</li>`).join('') || '<li>No items provided.</li>'}</ul></article>`).join('') : '<p class="evidence">No Stage 1 lists provided.</p>'}
        <article class="card">
          <h3>Debate triggers</h3>
          <ul>${stage1Triggers.length ? stage1Triggers.map((trigger) => `<li>${escapeHtml(asText(trigger))}</li>`).join('') : '<li>No triggers provided.</li>'}</ul>
        </article>
      </section>

      <section id="stage-2">
        <h2>Stage 2 — Persona evaluations</h2>
        ${personaCards}
      </section>

      <section id="stage-3">
        <h2>Stage 3 — IC debate rounds</h2>
        ${roundsMarkup}
      </section>

      <section id="stage-4" class="report-section">
        <h2>Stage 4 — Synthesis</h2>
        <p><strong>Executive summary:</strong> ${escapeHtml(asText(stage4.summary, 'No executive summary provided.'))}</p>
        <div class="cards three-up">
          <article class="card"><h3>Insights</h3><ul>${asArray(stage4.insights).map((item) => `<li>${escapeHtml(asText(item, 'Missing insight'))}</li>`).join('') || '<li>No insights provided.</li>'}</ul></article>
          <article class="card"><h3>Founder questions</h3><ul>${asArray(stage4.questions).map((item) => `<li>${escapeHtml(asText(item, 'Missing question'))}</li>`).join('') || '<li>No founder questions provided.</li>'}</ul></article>
          <article class="card"><h3>Action plans</h3><ul>${asArray(stage4.plans).map((item) => `<li>${escapeHtml(asText(item, 'Missing plan'))}</li>`).join('') || '<li>No action plans provided.</li>'}</ul></article>
        </div>
        <article class="card">
          <h3>Checklist</h3>
          <ul>${asArray(stage4.checklist).map((item) => `<li>${escapeHtml(asText(item, 'Missing checklist item'))}</li>`).join('') || '<li>No checklist provided.</li>'}</ul>
        </article>
      </section>

      <section id="epilogue" class="report-section">
        <h2>Epilogue</h2>
        <p><strong>Big number:</strong> ${escapeHtml(asText(report?.epilogue?.big_number, 'Not provided'))}</p>
        <p>${escapeHtml(asText(report?.epilogue?.context, 'No epilogue context provided.'))}</p>
      </section>

      <details class="report-section">
        <summary>Raw report JSON</summary>
        <pre><code>${escapeHtml(safeReportJson)}</code></pre>
      </details>
    </section>
  `;
}

function getSummaryForCopy(report) {
  const stage4 = report?.stages?.stage_4 || {};
  const insights = asArray(stage4.insights).slice(0, 5).map((line) => `- ${asText(line, 'Missing insight')}`).join('\n');
  return [
    asText(report?.hero?.title, 'Untitled report'),
    asText(stage4.summary, 'No executive summary provided.'),
    '',
    'Top insights:',
    insights || '- No insights provided.'
  ].join('\n');
}

async function hydrateDynamicReportPage() {
  const mount = document.querySelector('[data-report-root]');
  if (!mount) return;

  const slug = mount.dataset.reportSlug;
  if (!slug) {
    mount.innerHTML = '<p class="report-error">Missing report slug.</p>';
    return;
  }

  try {
    const response = await fetch(`../assets/reports/${encodeURIComponent(slug)}.json`);
    if (!response.ok) {
      throw new Error(`Unable to load report source for ${slug}.`);
    }

    const report = await response.json();
    mount.innerHTML = buildDynamicReportMarkup(report, slug);

    const copyJsonButton = mount.querySelector('[data-copy-json]');
    const copySummaryButton = mount.querySelector('[data-copy-summary]');

    copyJsonButton?.addEventListener('click', () => {
      copyText(JSON.stringify(report, null, 2), copyJsonButton);
    });

    copySummaryButton?.addEventListener('click', () => {
      copyText(getSummaryForCopy(report), copySummaryButton);
    });
  } catch (error) {
    mount.innerHTML = `<p class="report-error">${escapeHtml(error.message)}</p>`;
  }
}

(async () => {
  try {
    const reports = await loadReportManifest();
    renderPublishedReports(reports);
    hydrateReportPage(reports);
  } catch (error) {
    const mount = document.getElementById('published-reports-list');
    if (mount) {
      mount.innerHTML = `<article class="report-card"><h3>Unable to load report feed</h3><p>${escapeHtml(error.message)}</p></article>`;
    }
  }

  hydrateDynamicReportPage();
})();
