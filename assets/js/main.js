async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

async function renderReports() {
  const mount = document.getElementById('report-list');
  if (!mount) return;

  try {
    const reports = await fetchJson('assets/data/reports.json');

    if (!Array.isArray(reports) || reports.length === 0) {
      mount.innerHTML = `
        <article class="report-card">
          <h3>No reports published yet</h3>
          <p>Create <code>reports/&lt;slug&gt;.html</code> and add matching metadata in <code>assets/data/reports.json</code>.</p>
        </article>
      `;
      return;
    }

    mount.innerHTML = reports.map((report) => `
      <article class="report-card">
        <div class="report-top">
          <h3>${report.title}</h3>
          <div class="report-meta">
            <span class="meta-chip">Invest ${report.invest_count ?? 0}</span>
            <span class="meta-chip">Pass ${report.pass_count ?? 0}</span>
            <span class="meta-chip">Dig Deeper ${report.dig_deeper_count ?? 0}</span>
          </div>
        </div>
        <p>${report.summary}</p>
        <div class="report-meta">
          ${(report.tags || []).map((tag) => `<span class="meta-chip">${tag}</span>`).join('')}
          <span class="meta-chip">${report.stage || 'Stage n/a'}</span>
          <span class="meta-chip">${report.year || 'Year n/a'}</span>
        </div>
        <a class="report-link" href="reports/${report.slug}.html">Read report →</a>
      </article>
    `).join('');
  } catch (error) {
    mount.innerHTML = `<article class="report-card"><h3>Unable to load report feed</h3><p>${error.message}</p></article>`;
  }
}

async function renderPersonaNames() {
  const mount = document.getElementById('persona-grid');
  if (!mount) return;

  try {
    const data = await fetchJson('assets/data/personas.json');
    mount.innerHTML = (data.names_exact || []).map((name) => `<span class="chip">${name}</span>`).join('');
  } catch (error) {
    mount.innerHTML = `<p>${error.message}</p>`;
  }
}

async function renderPersonaCards() {
  const mount = document.getElementById('persona-cards');
  if (!mount) return;

  try {
    const profiles = await fetchJson('assets/data/persona_profiles.json');
    mount.innerHTML = profiles.map((p) => `
      <article class="card persona-card reveal fade-up">
        <h3>${p.name}</h3>
        <p class="muted">${p.tagline}</p>
        <p>${p.lens}</p>
        <div class="inline-chips">
          ${(p.keywords || []).map((k) => `<span class="meta-chip">${k}</span>`).join('')}
        </div>
      </article>
    `).join('');
    setupRevealOnScroll();
  } catch (error) {
    mount.innerHTML = `<article class="card"><p>${error.message}</p></article>`;
  }
}

function setupCopyPromptButton() {
  const copyButton = document.getElementById('copy-prompt');
  const promptText = document.getElementById('prompt-text');
  if (!copyButton || !promptText) return;

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(promptText.textContent || '');
      copyButton.textContent = 'Copied';
      setTimeout(() => {
        copyButton.textContent = 'Copy Full Prompt';
      }, 1200);
    } catch (_error) {
      copyButton.textContent = 'Copy failed';
      setTimeout(() => {
        copyButton.textContent = 'Copy Full Prompt';
      }, 1400);
    }
  });
}

function setupRevealOnScroll() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.16 });

  items.forEach((el) => io.observe(el));
}

renderReports();
renderPersonaNames();
renderPersonaCards();
setupCopyPromptButton();
setupRevealOnScroll();
