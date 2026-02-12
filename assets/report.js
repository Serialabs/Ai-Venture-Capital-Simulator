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
