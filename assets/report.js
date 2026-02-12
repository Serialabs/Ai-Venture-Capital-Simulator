async function loadReportManifest() {
  const response = await fetch('../assets/data/reports.json');
  if (!response.ok) {
    throw new Error('Unable to load report manifest.');
  }
  return response.json();
}

async function loadReportPayload(slug) {
  const response = await fetch(`../assets/reports/${slug}.json`);
  if (!response.ok) {
    return null;
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

function getReportMount(root) {
  return root.querySelector('[data-report-mount]')
    || root.querySelector('[data-report-root]')
    || root.querySelector('article');
}

function toDecisionClass(verdict) {
  return verdict === 'INVEST' ? 'decision-invest' : 'decision-pass';
}

function renderStructuredReport(mount, report, payload) {
  const evidenceCards = payload.evidence_summary?.cards || [];
  const strengths = payload.stages?.stage_1?.lists?.[0]?.items || [];
  const risks = payload.stages?.stage_1?.lists?.[1]?.items || [];
  const insights = payload.stages?.stage_4?.insights || [];
  const questions = payload.stages?.stage_4?.questions || [];
  const plans = payload.stages?.stage_4?.plans || [];

  mount.innerHTML = `
    <p class="eyebrow">Published report</p>
    <h1>${payload.hero?.title || report.title}</h1>
    <div class="report-meta-line">
      <span class="meta-chip">${report.published_at}</span>
      <span class="meta-chip">${report.decision_label}</span>
      <span class="meta-chip">${report.confidence}</span>
      <span class="meta-chip">${report.reading_time}</span>
    </div>
    <p class="lede">${payload.hero?.subtitle || report.summary}</p>

    <section class="report-section">
      <h2>Executive Summary</h2>
      <p>
        <span class="decision ${toDecisionClass(payload.evidence_summary?.verdict)}">${report.decision_label}</span>
        ${payload.stages?.stage_4?.summary || report.summary}
      </p>
    </section>

    <section class="report-section">
      <h2>Key Insights</h2>
      <ul>
        ${insights.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </section>

    <section class="report-section">
      <h2>Strengths & Risks</h2>
      <ul>
        ${strengths.map((item) => `<li><strong>Strength:</strong> ${item}</li>`).join('')}
        ${risks.map((item) => `<li><strong>Risk:</strong> ${item}</li>`).join('')}
      </ul>
    </section>

    <section class="report-section">
      <h2>Evidence Snapshots</h2>
      <ul>
        ${evidenceCards.map((card) => `<li><strong>${card.title}:</strong> ${card.summary}</li>`).join('')}
      </ul>
    </section>

    <section class="report-section">
      <h2>Founder Questions</h2>
      <ol>
        ${questions.map((item) => `<li>${item}</li>`).join('')}
      </ol>
    </section>

    <section class="report-section">
      <h2>Action Plan</h2>
      <ul>
        ${plans.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </section>
  `;
}

async function hydrateReportPage(reports) {
  const root = document.querySelector('.report-page[data-report-slug]');
  if (!root) return;

  const slug = root.dataset.reportSlug;
  const report = reports.find((item) => item.slug === slug);
  if (!report) return;

  const meta = root.querySelector('[data-report-meta]');
  if (meta) {
    meta.innerHTML = `
      <span class="meta-chip">${report.published_at}</span>
      <span class="meta-chip">${report.decision_label}</span>
      <span class="meta-chip">${report.confidence}</span>
      <span class="meta-chip">${report.reading_time}</span>
    `;
  }

  const mount = getReportMount(root);
  if (!mount) return;

  const payload = await loadReportPayload(slug);
  if (payload) {
    renderStructuredReport(mount, report, payload);
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
      mount.innerHTML = `<article class="report-card"><h3>Unable to load report feed</h3><p>${error.message}</p></article>`;
    }
  }
})();
