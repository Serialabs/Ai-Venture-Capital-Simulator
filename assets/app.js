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
    const list = Array.isArray(data) ? data : data?.personas || data?.names_exact || [];

    if (!Array.isArray(list) || !list.length) {
      mount.innerHTML = `
        <article class="report-card">
          <h3>No personas found</h3>
          <p class="muted">Add persona names to <code>assets/data/personas.json</code> using an array payload, <code>{ personas: [] }</code>, or <code>{ names_exact: [] }</code>.</p>
        </article>
      `;
      return;
    }

    mount.innerHTML = list.map((name) => `<span class="chip">${name}</span>`).join('');
  } catch (error) {
    mount.innerHTML = `
      <article class="report-card" role="alert">
        <h3>Unable to load personas</h3>
        <p class="muted">Expected persona data at <code>assets/data/personas.json</code>.</p>
        <p>${error.message}</p>
      </article>
    `;
  }
}

async function loadPromptText() {
  const promptText = document.getElementById('prompt-text');
  if (!promptText) return;

  const EXPECTED_PROMPT_PATH = 'assets/content/ic_prompt_v2.txt';

  const ensurePromptAlert = () => {
    const existingAlert = document.getElementById('prompt-alert');
    if (existingAlert) return existingAlert;

    const alert = document.createElement('div');
    alert.id = 'prompt-alert';
    alert.className = 'prompt-alert';
    alert.style.display = 'none';
    alert.style.marginTop = '0.75rem';
    alert.style.padding = '0.75rem 1rem';
    alert.style.border = '1px solid #fecaca';
    alert.style.borderRadius = '0.75rem';
    alert.style.background = '#fef2f2';
    alert.style.color = '#991b1b';
    alert.setAttribute('role', 'alert');

    promptText.insertAdjacentElement('afterend', alert);
    return alert;
  };

  const setPromptState = ({ status, message, errorMessage }) => {
    const alert = ensurePromptAlert();
    promptText.classList.remove('prompt-loading', 'prompt-success', 'prompt-error');
    promptText.classList.add(`prompt-${status}`);
    promptText.dataset.promptAvailable = status === 'success' ? 'true' : 'false';

    if (status === 'error') {
      promptText.textContent = message || '';
      alert.textContent = errorMessage || `Prompt unavailable. Expected file: ${EXPECTED_PROMPT_PATH}.`;
      alert.style.display = 'block';
      promptText.dispatchEvent(new CustomEvent('prompt-state-change'));
      return;
    }

    promptText.textContent = message;
    alert.style.display = 'none';
    alert.textContent = '';
    promptText.dispatchEvent(new CustomEvent('prompt-state-change'));
  };

  const src = promptText.dataset.promptSrc;
  if (!src) {
    setPromptState({
      status: 'error',
      message: '',
      errorMessage: `Prompt source is missing. Expected file: ${EXPECTED_PROMPT_PATH}.`
    });
    return;
  }

  setPromptState({ status: 'loading', message: 'Loading prompt...' });

  try {
    const promptUrl = new URL(src, document.baseURI);
    const res = await fetch(promptUrl.toString());
    if (!res.ok) throw new Error('Failed to load prompt');
    const promptContent = await res.text();
    setPromptState({ status: 'success', message: promptContent });
  } catch (error) {
    setPromptState({
      status: 'error',
      message: '',
      errorMessage: `${error.message}. Expected file: ${EXPECTED_PROMPT_PATH}.`
    });
  }
}

function setupCopyPromptButton() {
  const copyButton = document.getElementById('copy-prompt');
  const promptText = document.getElementById('prompt-text');
  if (!copyButton || !promptText) return;

  const resetCopyButtonText = () => {
    copyButton.textContent = 'Copy Full Prompt';
  };

  const setTemporaryButtonText = (text) => {
    copyButton.textContent = text;
    setTimeout(resetCopyButtonText, 1200);
  };

  const updateCopyButtonAvailability = () => {
    const promptAvailable = promptText.dataset.promptAvailable === 'true';
    copyButton.disabled = !promptAvailable;
    copyButton.setAttribute('aria-disabled', String(!promptAvailable));
  };

  updateCopyButtonAvailability();
  promptText.addEventListener('prompt-state-change', updateCopyButtonAvailability);

  copyButton.addEventListener('click', async () => {
    const promptAvailable = promptText.dataset.promptAvailable === 'true';
    if (!promptAvailable) {
      setTemporaryButtonText('Prompt unavailable');
      updateCopyButtonAvailability();
      return;
    }

    try {
      await navigator.clipboard.writeText(promptText.textContent || '');
      setTemporaryButtonText('Copied');
    } catch (_error) {
      setTemporaryButtonText('Copy failed');
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
