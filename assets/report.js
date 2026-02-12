(function reportPage() {
  const DECISION_CLASSES = {
    INVEST: 'invest',
    DIG_DEEPER: 'dig-deeper',
    PASS: 'pass'
  };

  const slugElement = document.querySelector('[data-report-slug]');
  if (!slugElement) {
    return;
  }

  const slug = (slugElement.getAttribute('data-report-slug') || '').trim();
  if (!slug) {
    slugElement.innerHTML = '<p class="report-error">Missing report slug.</p>';
    return;
  }

  const mount = document.querySelector('[data-report-root]') || slugElement;

  init().catch((error) => {
    mount.innerHTML = `<p class="report-error">Unable to load report: ${escapeHtml(error.message || 'unknown error')}.</p>`;
  });

  async function init() {
    const reportPromise = fetchJson(`/assets/reports/${encodeURIComponent(slug)}.json`);
    const metadataPromise = fetchJson('/assets/data/reports.json').catch(() => null);
    const [report, metadataList] = await Promise.all([reportPromise, metadataPromise]);
    const fallbackMeta = Array.isArray(metadataList)
      ? metadataList.find((item) => item && item.slug === slug)
      : null;

    renderReport(normalizeReport(report, fallbackMeta || {}));
    wireClipboardHandlers();
  }

  function normalizeReport(report, fallbackMeta) {
    const hero = report.hero || {};
    const evidence = report.evidence_summary || report.evidenceSummary || {};
    const stages = report.stages || {};

    return {
      title: hero.title || report.title || fallbackMeta.title || slug,
      subtitle: hero.subtitle || report.subtitle || fallbackMeta.summary || '',
      publishedAt: hero.date || report.published_at || fallbackMeta.published_at || '',
      source: hero.source || report.source || '',
      chips: arr(hero.chips || report.tags || fallbackMeta.tags),
      evidenceCards: arr(evidence.cards).slice(0, 3),
      evidenceVerdict: evidence.verdict || report.verdict || fallbackMeta.decision_label || '',
      stage1: stages.stage_1 || stages.stage1 || {},
      stage2: stages.stage_2 || stages.stage2 || {},
      stage3: stages.stage_3 || stages.stage3 || {},
      stage4: stages.stage_4 || stages.stage4 || {}
    };
  }

  function renderReport(data) {
    const decisionKey = String(data.evidenceVerdict || '').toUpperCase();
    const decisionClass = DECISION_CLASSES[decisionKey] || 'dig-deeper';
    const stageSections = [
      renderStageOne(data.stage1),
      renderStageTwo(data.stage2),
      renderStageThree(data.stage3),
      renderStageFour(data.stage4)
    ];

    mount.innerHTML = `
      <div class="dynamic-report" data-report-slug="${escapeHtml(slug)}">
        <nav class="dynamic-report__toc" aria-label="Report table of contents">
          <a href="#evidence-summary">Evidence summary</a>
          <a href="#stage-1">Stage 1</a>
          <a href="#stage-2">Stage 2</a>
          <a href="#stage-3">Stage 3</a>
          <a href="#stage-4">Stage 4</a>
        </nav>

        <section class="dynamic-report__hero report-section" id="report-hero">
          <div>
            <p class="eyebrow">Report</p>
            <h1>${escapeHtml(data.title)}</h1>
            ${data.subtitle ? `<p class="lede">${escapeHtml(data.subtitle)}</p>` : ''}
            <div class="report-meta">
              ${data.publishedAt ? `<span class="meta-chip">${escapeHtml(data.publishedAt)}</span>` : ''}
              ${data.source ? `<span class="meta-chip">Source: ${escapeHtml(data.source)}</span>` : ''}
              ${data.chips.map((chip) => `<span class="meta-chip">${escapeHtml(chip)}</span>`).join('')}
            </div>
          </div>
          <div class="dynamic-report__actions">
            <button class="btn secondary" data-copy="full-report" type="button">Copy full report</button>
            <button class="btn secondary" data-copy="report-link" type="button">Copy link</button>
          </div>
        </section>

        <section class="report-section" id="evidence-summary" data-stage-name="Evidence Summary">
          <h2>Evidence Summary</h2>
          <div class="cards three-up">
            ${renderEvidenceCards(data.evidenceCards)}
          </div>
          <div class="verdict-strip ${decisionClass}">
            <strong>Verdict:</strong> ${escapeHtml(formatVerdict(data.evidenceVerdict))}
          </div>
        </section>

        ${stageSections.join('')}
      </div>
    `;
  }

  function renderEvidenceCards(cards) {
    if (!cards.length) {
      return '<article class="card"><h3>No evidence cards provided</h3></article>';
    }

    return cards
      .map((card, index) => {
        const title = card.title || `Evidence ${index + 1}`;
        const summary = card.summary || card.text || '';
        return `<article class="card"><h3>${escapeHtml(title)}</h3>${summary ? `<p>${escapeHtml(summary)}</p>` : ''}</article>`;
      })
      .join('');
  }

  function renderStageOne(stage) {
    const kv = stage.kv || stage.key_values || stage.keyValues || {};
    const lists = arr(stage.lists || stage.blocks || []);

    return `
      <section class="report-section" id="stage-1" data-stage-name="Stage 1">
        <div class="section-head">
          <h2>Stage 1</h2>
          <button class="btn secondary" data-copy="stage" data-stage-id="stage-1" type="button">Copy section</button>
        </div>
        <div class="cards three-up">
          ${Object.keys(kv).length
            ? Object.entries(kv)
                .map(([label, value]) => `<article class="card"><h3>${escapeHtml(label)}</h3><p>${escapeHtml(value)}</p></article>`)
                .join('')
            : '<article class="card"><h3>No key values provided</h3></article>'}
        </div>
        <div class="cards">
          ${lists
            .map((block) => `
              <article class="card">
                <h3>${escapeHtml(block.title || 'List')}</h3>
                <ul>${arr(block.items).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
              </article>
            `)
            .join('')}
        </div>
      </section>
    `;
  }

  function renderStageTwo(stage) {
    const personas = arr(stage.personas || stage.cards || []);

    return `
      <section class="report-section" id="stage-2" data-stage-name="Stage 2">
        <div class="section-head">
          <h2>Stage 2</h2>
          <div class="dynamic-report__actions-inline">
            <button class="btn secondary" data-toggle="personas" data-action="expand" type="button">Expand all</button>
            <button class="btn secondary" data-toggle="personas" data-action="collapse" type="button">Collapse all</button>
            <button class="btn secondary" data-copy="stage" data-stage-id="stage-2" type="button">Copy section</button>
          </div>
        </div>
        <div class="cards">
          ${personas
            .map(
              (persona, idx) => `
              <details class="card" ${idx === 0 ? '' : ''}>
                <summary>${escapeHtml(persona.name || `Persona ${idx + 1}`)}</summary>
                <p>${escapeHtml(persona.summary || '')}</p>
                ${arr(persona.signals).length ? `<ul>${arr(persona.signals).map((signal) => `<li>${escapeHtml(signal)}</li>`).join('')}</ul>` : ''}
              </details>
            `
            )
            .join('') || '<article class="card"><h3>No personas provided</h3></article>'}
        </div>
      </section>
    `;
  }

  function renderStageThree(stage) {
    const rounds = arr(stage.rounds || []);

    return `
      <section class="report-section" id="stage-3" data-stage-name="Stage 3">
        <div class="section-head">
          <h2>Stage 3</h2>
          <button class="btn secondary" data-copy="stage" data-stage-id="stage-3" type="button">Copy section</button>
        </div>
        <div class="cards">
          ${rounds
            .map(
              (round, idx) => `
                <details class="card" ${idx === 0 ? 'open' : ''}>
                  <summary>${escapeHtml(round.title || `Round ${idx + 1}`)}</summary>
                  ${round.summary ? `<p>${escapeHtml(round.summary)}</p>` : ''}
                  ${arr(round.points).length ? `<ul>${arr(round.points).map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>` : ''}
                </details>
              `
            )
            .join('') || '<article class="card"><h3>No rounds provided</h3></article>'}
        </div>
      </section>
    `;
  }

  function renderStageFour(stage) {
    const sections = [
      ['Summary', stage.summary],
      ['Insights', arr(stage.insights)],
      ['Questions', arr(stage.questions)],
      ['Plans', arr(stage.plans || stage.action_plans)],
      ['Checklist', arr(stage.checklist)]
    ];

    return `
      <section class="report-section" id="stage-4" data-stage-name="Stage 4">
        <div class="section-head">
          <h2>Stage 4</h2>
          <button class="btn secondary" data-copy="stage" data-stage-id="stage-4" type="button">Copy section</button>
        </div>
        <div class="cards">
          ${sections
            .map(([title, value]) => {
              if (!value || (Array.isArray(value) && !value.length)) {
                return '';
              }
              const content = Array.isArray(value)
                ? `<ul>${value.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
                : `<p>${escapeHtml(value)}</p>`;
              return `<article class="card"><h3>${escapeHtml(title)}</h3>${content}</article>`;
            })
            .join('') || '<article class="card"><h3>No summary details provided</h3></article>'}
        </div>
      </section>
    `;
  }

  function wireClipboardHandlers() {
    mount.querySelectorAll('[data-copy="full-report"]').forEach((button) => {
      button.addEventListener('click', () => copyText(buildFullReportText()));
    });

    mount.querySelectorAll('[data-copy="report-link"]').forEach((button) => {
      button.addEventListener('click', () => copyText(window.location.href));
    });

    mount.querySelectorAll('[data-copy="stage"]').forEach((button) => {
      button.addEventListener('click', () => {
        const stageId = button.getAttribute('data-stage-id');
        if (!stageId) {
          return;
        }
        copyText(buildStageText(stageId));
      });
    });

    mount.querySelectorAll('[data-toggle="personas"]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.getAttribute('data-action');
        mount.querySelectorAll('#stage-2 details').forEach((detail) => {
          detail.open = action === 'expand';
        });
      });
    });
  }

  function buildFullReportText() {
    const blocks = [
      document.title,
      buildSectionText(mount.querySelector('#report-hero')),
      buildSectionText(mount.querySelector('#evidence-summary')),
      buildSectionText(mount.querySelector('#stage-1')),
      buildSectionText(mount.querySelector('#stage-2')),
      buildSectionText(mount.querySelector('#stage-3')),
      buildSectionText(mount.querySelector('#stage-4'))
    ].filter(Boolean);

    return blocks.join('\n\n');
  }

  function buildStageText(stageId) {
    const section = mount.querySelector(`#${CSS.escape(stageId)}`);
    if (!section) {
      return '';
    }

    return buildSectionText(section);
  }

  function buildSectionText(section) {
    if (!section) {
      return '';
    }

    const label = section.getAttribute('data-stage-name') || section.querySelector('h1, h2')?.textContent || '';
    const content = (section.innerText || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n');

    return `${label}\n${'-'.repeat(label.length)}\n${content}`;
  }

  async function copyText(value) {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
  }

  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function formatVerdict(value) {
    return String(value || 'DIG_DEEPER').replace(/_/g, ' ');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
})();
