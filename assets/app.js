async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

async function renderReports() {
  const mount = document.getElementById('report-list');
  if (!mount) return;

  try {
    const reports = await fetchJson('assets/data/reports.json');
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
    const data = await fetchJson('assets/data/personas.json');
    mount.innerHTML = data.names_exact.map((name) => `<span class="chip">${name}</span>`).join('');
  } catch (error) {
    mount.innerHTML = `<p>${error.message}</p>`;
  }
}

async function loadPromptText() {
  const promptText = document.getElementById('prompt-text');
  if (!promptText) return;

  const src = promptText.dataset.promptSrc;
  if (!src) return;

  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error('Failed to load prompt');
    promptText.textContent = await res.text();
  } catch (error) {
    promptText.textContent = error.message;
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
    } catch (_error) {
      copyButton.textContent = 'Copy failed';
    }
    setTimeout(() => {
      copyButton.textContent = 'Copy Full Prompt';
    }, 1200);
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
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.16 });

  items.forEach((el) => io.observe(el));
}

renderReports();
renderPersonas();
loadPromptText();
setupCopyPromptButton();
setupRevealOnScroll();
