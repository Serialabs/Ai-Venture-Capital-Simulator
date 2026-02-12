async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

const ALLOWED_VERDICTS = new Set(['INVEST', 'DIG_DEEPER', 'PASS']);

function getReports(data) {
  if (!data || !Array.isArray(data.reports)) {
    throw new Error('Invalid reports payload: expected { reports: [] }');
  }

  return data.reports.map((report) => {
    const verdicts = report?.verdicts || {};
    ['bull', 'bear', 'wild'].forEach((key) => {
      if (!ALLOWED_VERDICTS.has(verdicts[key])) {
        throw new Error(`Invalid verdict for ${report.slug || 'unknown report'}: ${key}`);
      }
    });
    return report;
  });
}

async function renderReports() {
  const mount = document.getElementById('report-list');
  if (!mount) return;

  try {
    const data = await fetchJson('assets/data/reports.json');
    const reports = getReports(data);
    mount.innerHTML = reports.map((report) => `
      <article class="report-card">
        <div class="report-top">
          <h3>${report.title}</h3>
          <p class="muted">${report.subtitle || ''}</p>
          <div class="report-meta">
            <span class="meta-chip">Bull: ${report.verdicts.bull}</span>
            <span class="meta-chip">Bear: ${report.verdicts.bear}</span>
            <span class="meta-chip">Wild: ${report.verdicts.wild}</span>
          </div>
        </div>
        <p>${report.description}</p>
        <div class="report-meta">
          ${(report.tags || []).map((tag) => `<span class="meta-chip">${tag}</span>`).join('')}
          <span class="meta-chip">${report.date}</span>
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
