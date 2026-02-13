async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
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
  const groupMounts = {
    'VC Gurus': document.getElementById('vc-gurus-grid'),
    'Bright Minds': document.getElementById('bright-minds-grid')
  };

  if (!groupMounts['VC Gurus'] && !groupMounts['Bright Minds']) return;

  const countMounts = {
    'VC Gurus': document.getElementById('vc-gurus-count'),
    'Bright Minds': document.getElementById('bright-minds-count')
  };

  const toTagRows = (persona) => {
    if (Array.isArray(persona.tag_rows) && persona.tag_rows.length) return persona.tag_rows;
    if (Array.isArray(persona.tagRows) && persona.tagRows.length) return persona.tagRows;

    const inferredRows = [
      persona.focusTags || persona.focus_tags || [],
      persona.debateTags || persona.debate_tags || [],
      persona.watchTags || persona.watch_tags || []
    ].filter((row) => Array.isArray(row) && row.length);

    if (inferredRows.length) return inferredRows;
    if (Array.isArray(persona.keywords) && persona.keywords.length) {
      return [persona.keywords.slice(0, 3)];
    }

    return [];
  };

  const toTagRowHtml = (row) => {
    const tags = Array.isArray(row)
      ? row
      : Object.entries(row || {}).map(([key, value]) => `${key}: ${value}`);
    return `
      <div class="persona-tag-row">
        ${tags.map((tag) => `<span class="meta-chip">${tag}</span>`).join('')}
      </div>
    `;
  };

  const renderPersonaCard = (persona) => {
    const subtitle = persona.subtitle || persona.tagline || '';
    const description = persona.description || persona.lens || '';
    const icon = persona.icon || '🧠';
    const tagRows = toTagRows(persona).slice(0, 3);

    while (tagRows.length < 3) tagRows.push([]);

    return `
      <article class="card persona-card reveal fade-up">
        <div class="persona-card-head">
          <span class="persona-icon" aria-hidden="true">${icon}</span>
          <div>
            <h4>${persona.name || 'Unknown Persona'}</h4>
            <p class="muted">${subtitle}</p>
          </div>
        </div>
        <p>${description}</p>
        <div class="persona-tag-rows">
          ${tagRows.map((row) => toTagRowHtml(row)).join('')}
        </div>
      </article>
    `;
  };

  try {
    const data = await fetchJson('assets/data/persona_profiles.json');
    const profiles = Array.isArray(data) ? data : data?.personas || [];

    if (!profiles.length) {
      Object.values(groupMounts).forEach((mount) => {
        if (!mount) return;
        mount.innerHTML = '<article class="report-card"><p>No persona profiles found.</p></article>';
      });
      return;
    }

    const grouped = profiles.reduce((acc, persona) => {
      const key = persona.group || 'VC Gurus';
      acc[key] = acc[key] || [];
      acc[key].push(persona);
      return acc;
    }, {});

    Object.entries(groupMounts).forEach(([groupName, mount]) => {
      if (!mount) return;
      const groupPersonas = grouped[groupName] || [];
      mount.innerHTML = groupPersonas.map(renderPersonaCard).join('') || '<article class="card"><p class="muted">No personas in this group yet.</p></article>';

      const countMount = countMounts[groupName];
      if (countMount) {
        const count = groupPersonas.length;
        countMount.textContent = `${count} member${count === 1 ? '' : 's'}`;
      }
    });

    setupRevealOnScroll();
  } catch (error) {
    Object.values(groupMounts).forEach((mount) => {
      if (!mount) return;
      mount.innerHTML = `
        <article class="report-card" role="alert">
          <h4>Unable to load persona profiles</h4>
          <p>${error.message}</p>
        </article>
      `;
    });
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
renderPersonas();
setupCopyPromptButton();
setupRevealOnScroll();
