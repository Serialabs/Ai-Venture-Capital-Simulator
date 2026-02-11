async function renderReports() {
  const mount = document.getElementById('report-list');
  if (!mount) return;

  try {
    const res = await fetch('assets/data/reports.json');
    if (!res.ok) throw new Error('Failed to load report metadata');
    const reports = await res.json();

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
          ${report.tags.map((tag) => `<span class="meta-chip">${tag}</span>`).join('')}
          <span class="meta-chip">${report.published_at}</span>
        </div>
        <a class="report-link" href="reports/${report.slug}.html">Read report →</a>
      </article>
    `).join('');
  } catch (error) {
    mount.innerHTML = `<article class="report-card"><h3>Unable to load report feed</h3><p>${error.message}</p></article>`;
  }
}

async function renderPersonas() {
  const mount = document.getElementById('persona-grid');
  if (!mount) return;

  try {
    const res = await fetch('assets/data/personas.json');
    if (!res.ok) throw new Error('Failed to load personas');
    const data = await res.json();
    mount.innerHTML = data.names_exact.map((name) => `<span class="chip">${name}</span>`).join('');
  } catch (error) {
    mount.innerHTML = `<p>${error.message}</p>`;
  }
}

renderReports();
renderPersonas();
