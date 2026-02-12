async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  return response.json();
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

function renderPersonaNameChips(mount, names) {
  mount.innerHTML = names.map((name) => `<span class="chip">${name}</span>`).join('');
}

async function renderPersonas() {
  const mount = document.getElementById('persona-grid');
  if (!mount) return;

  try {
    const data = await fetchJson('assets/data/personas.json');
    renderPersonaNameChips(mount, data.names_exact || []);
  } catch (error) {
    mount.innerHTML = `<p>${error.message}</p>`;
  }
}

async function renderMethodsPersonaNames() {
  const mount = document.getElementById('methods-persona-names');
  if (!mount) return;

  try {
    const data = await fetchJson('assets/data/personas.json');
    renderPersonaNameChips(mount, data.names_exact || []);
  } catch (error) {
    mount.textContent = error.message;
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

function resolveCopyText(button) {
  const inlineText = button.getAttribute('data-copy-text');
  if (inlineText !== null) return inlineText;

  const targetSelector = button.getAttribute('data-copy-target');
  if (!targetSelector) return '';

  const target = document.querySelector(targetSelector);
  return target ? (target.textContent || '') : '';
}

function setTemporaryButtonLabel(button, nextLabel, timeoutMs) {
  const originalLabel = button.dataset.copyOriginalLabel || button.textContent || '';
  button.dataset.copyOriginalLabel = originalLabel;
  button.textContent = nextLabel;

  window.setTimeout(() => {
    button.textContent = originalLabel;
  }, timeoutMs);
}

function initializeCopyButtons() {
  const copyButtons = document.querySelectorAll('[data-copy-text], [data-copy-target]');
  copyButtons.forEach((button) => {
    if (button.dataset.copyBound === 'true') return;
    button.dataset.copyBound = 'true';

    button.addEventListener('click', async () => {
      const textToCopy = resolveCopyText(button);
      const copiedLabel = button.dataset.copiedLabel || 'Copied';
      const failedLabel = button.dataset.copyErrorLabel || 'Copy failed';
      const resetMs = Number(button.dataset.copyResetMs || 1200);

      try {
        await navigator.clipboard.writeText(textToCopy);
        setTemporaryButtonLabel(button, copiedLabel, resetMs);
      } catch (_error) {
        setTemporaryButtonLabel(button, failedLabel, Math.max(resetMs, 1400));
      }
    });
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

document.addEventListener('DOMContentLoaded', () => {
  initializeCopyButtons();
  setupRevealOnScroll();
  renderReports();
  renderPersonas();
  renderMethodsPersonaNames();
  renderPersonaCards();
});
