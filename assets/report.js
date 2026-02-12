const REVEAL_TIMING_MS = 420;
const REVEAL_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const REVEAL_STAGGER_MS = 70;

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

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
    <article class="report-card reveal fade-up">
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

function isReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function setupMotionPreference() {
  document.documentElement.classList.toggle('motion-reduce', isReducedMotion());
}

function setupRevealOnScroll() {
  const items = Array.from(document.querySelectorAll('.reveal'));
  if (!items.length) return;

  const reduced = isReducedMotion();
  items.forEach((el, index) => {
    el.style.setProperty('--reveal-duration', `${REVEAL_TIMING_MS}ms`);
    el.style.setProperty('--reveal-easing', REVEAL_EASING);
    el.style.setProperty('--reveal-delay', reduced ? '0ms' : `${index * REVEAL_STAGGER_MS}ms`);
  });

  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.12,
  });

  items.forEach((el) => io.observe(el));
}

function withUniqueHeadingIds(headings) {
  const used = new Set();
  headings.forEach((heading, index) => {
    if (!heading.id) {
      const base = slugify(heading.textContent) || `section-${index + 1}`;
      let id = base;
      let count = 2;
      while (used.has(id) || document.getElementById(id)) {
        id = `${base}-${count++}`;
      }
      heading.id = id;
    }
    used.add(heading.id);
  });
}

function getPageReadPercent() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return 100;
  return Math.max(0, Math.min(100, (scrollTop / docHeight) * 100));
}

function setupReadingProgress() {
  const page = document.querySelector('.report-page');
  if (!page) return;

  const bar = document.createElement('div');
  bar.className = 'report-progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<span class="report-progress__bar"></span>';
  document.body.prepend(bar);

  const progress = bar.querySelector('.report-progress__bar');
  const update = () => {
    progress.style.transform = `scaleX(${getPageReadPercent() / 100})`;
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

async function writeToClipboard(value) {
  await navigator.clipboard.writeText(value);
}

function attachCopyFeedback(button, successLabel) {
  const defaultLabel = button.textContent;
  button.textContent = successLabel;
  setTimeout(() => {
    button.textContent = defaultLabel;
  }, 1200);
}

function setupCopyActions(reportPage, headingNodes) {
  const article = reportPage.querySelector('article');
  if (!article) return;

  const toolbar = document.createElement('div');
  toolbar.className = 'report-actions reveal fade-up';
  toolbar.innerHTML = `
    <button type="button" data-copy="full">Copy full report</button>
    <button type="button" data-copy="link">Copy report link</button>
  `;

  const insertTarget = article.querySelector('h1');
  if (insertTarget) {
    insertTarget.insertAdjacentElement('afterend', toolbar);
  } else {
    article.prepend(toolbar);
  }

  toolbar.addEventListener('click', async (event) => {
    const btn = event.target.closest('button[data-copy]');
    if (!btn) return;

    try {
      if (btn.dataset.copy === 'full') {
        await writeToClipboard(article.innerText.trim());
        attachCopyFeedback(btn, 'Copied');
      } else if (btn.dataset.copy === 'link') {
        await writeToClipboard(window.location.href);
        attachCopyFeedback(btn, 'Copied');
      }
    } catch (_error) {
      attachCopyFeedback(btn, 'Copy failed');
    }
  });

  headingNodes.forEach((heading) => {
    const section = heading.closest('.report-section');
    if (!section) return;

    const actions = document.createElement('div');
    actions.className = 'section-actions';
    actions.innerHTML = `
      <button type="button" data-copy="section">Copy section</button>
      <button type="button" data-copy="section-link">Copy link</button>
    `;
    heading.insertAdjacentElement('afterend', actions);

    actions.addEventListener('click', async (event) => {
      const btn = event.target.closest('button[data-copy]');
      if (!btn) return;

      try {
        if (btn.dataset.copy === 'section') {
          await writeToClipboard(section.innerText.trim());
          attachCopyFeedback(btn, 'Copied');
        } else {
          const url = new URL(window.location.href);
          url.hash = heading.id;
          await writeToClipboard(url.toString());
          history.replaceState(null, '', url.hash);
          attachCopyFeedback(btn, 'Copied');
        }
      } catch (_error) {
        attachCopyFeedback(btn, 'Copy failed');
      }
    });
  });
}

function setupCollapsibles() {
  const candidates = Array.from(document.querySelectorAll('.report-section')).filter((section) => {
    const heading = section.querySelector('h2, h3, h4');
    if (!heading) return false;
    const text = heading.textContent || '';
    return /persona|round/i.test(text) || /persona|round/i.test(section.className);
  });

  candidates.forEach((section, idx) => {
    if (section.dataset.collapsibleReady === 'true') return;

    const heading = section.querySelector('h2, h3, h4');
    if (!heading) return;

    const panel = document.createElement('div');
    panel.className = 'report-collapsible__panel';

    while (heading.nextSibling) {
      panel.appendChild(heading.nextSibling);
    }

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'report-collapsible__toggle';
    toggle.setAttribute('aria-expanded', 'false');

    const panelId = `${heading.id || `collapsible-${idx + 1}`}-panel`;
    panel.id = panelId;
    panel.hidden = true;
    toggle.setAttribute('aria-controls', panelId);
    toggle.textContent = heading.textContent?.trim() || `Section ${idx + 1}`;

    heading.hidden = true;
    section.classList.add('report-collapsible');
    section.insertBefore(toggle, heading);
    section.appendChild(panel);
    section.dataset.collapsibleReady = 'true';

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
    });

    toggle.addEventListener('keydown', (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        toggle.click();
      }
    });
  });
}

function setupTocAndScrollspy() {
  const reportPage = document.querySelector('.report-page');
  if (!reportPage) return;

  const headings = Array.from(reportPage.querySelectorAll('.report-section h2, .report-section h3'));
  if (!headings.length) return;

  withUniqueHeadingIds(headings);

  const toc = document.createElement('nav');
  toc.className = 'report-toc reveal fade-up';
  toc.setAttribute('aria-label', 'Report table of contents');
  toc.innerHTML = `
    <p class="report-toc__title">On this page</p>
    <ul>
      ${headings.map((heading) => `<li><a href="#${heading.id}">${heading.textContent?.trim() || heading.id}</a></li>`).join('')}
    </ul>
  `;

  const article = reportPage.querySelector('article');
  const firstSection = reportPage.querySelector('.report-section');
  if (article && firstSection) {
    article.insertBefore(toc, firstSection);
  }

  const linkMap = new Map(Array.from(toc.querySelectorAll('a')).map((link) => [link.getAttribute('href')?.slice(1), link]));

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      linkMap.forEach((link) => link.classList.remove('is-active'));
      const active = linkMap.get(entry.target.id);
      if (active) active.classList.add('is-active');
    });
  }, {
    rootMargin: '-30% 0px -55% 0px',
    threshold: [0, 0.25, 0.6],
  });

  headings.forEach((heading) => observer.observe(heading));

  setupCopyActions(reportPage, headings);
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
  } finally {
    setupMotionPreference();
    setupTocAndScrollspy();
    setupReadingProgress();
    setupCollapsibles();
    setupRevealOnScroll();
  }
})();
