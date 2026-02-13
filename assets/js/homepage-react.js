(function renderHomePage() {
  const rootEl = document.getElementById('home-react-root');
  if (!rootEl || !window.React || !window.ReactDOM) return;

  const { createElement: h, useEffect, useState } = React;

  function App() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
      const tick = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(tick);
    }, []);

    return h(React.Fragment, null,
      h('section', { className: `home-v2__hero ${ready ? 'is-ready' : ''}` },
        h('span', { className: 'hero-badge' }, 'AIVC Reports'),
        h('h1', null, 'AI-Powered VC', h('br'), 'Investment Committee'),
        h('p', null, 'Investment committee simulation analyzed by 20 VC-style personas. Explore methods, reports, and decision logic.')
      ),

      h('section', { className: 'home-v2__section reveal-card', style: { '--delay': '120ms' } },
        h('p', { className: 'home-v2__label' }, 'How it works'),
        h('article', { className: 'home-v2__panel' },
          h('div', { className: 'home-v2__panel-head' },
            h('h2', null, 'AIVC Prompt — System Instructions'),
            h('a', { className: 'chip-link', href: 'methods.html' }, 'Open methods')
          ),
          h('p', null, '20 VC personas, a 4-stage analysis pipeline, and a 5-round debate structure drive the final committee verdict.'),
          h('div', { className: 'chip-row' },
            h('span', { className: 'home-chip' }, 'Prompt Engineering'),
            h('span', { className: 'home-chip' }, '20 Personas'),
            h('span', { className: 'home-chip' }, '5-Round Debate')
          )
        )
      ),

      h('section', { className: 'home-v2__section reveal-card', style: { '--delay': '230ms' } },
        h('div', { className: 'section-head' },
          h('p', { className: 'home-v2__label' }, 'Published reports'),
          h('a', { href: 'published-reports.html' }, 'View all')
        ),
        h('article', { className: 'home-v2__report' },
          h('div', { className: 'home-v2__panel-head' },
            h('h3', null, 'YouTube — 2005 Pitch Deck'),
            h('div', { className: 'score-pills' },
              h('span', { className: 'score-pill score-pill--invest' }, 'Invest +5'),
              h('span', { className: 'score-pill score-pill--pass' }, 'Pass +1')
            )
          ),
          h('p', null, 'Despite infrastructure and rights risk, early user pull and distribution behavior made the upside hard to ignore.'),
          h('div', { className: 'home-v2__report-foot' },
            h('div', { className: 'chip-row' },
              h('span', { className: 'home-chip' }, 'Video'),
              h('span', { className: 'home-chip' }, 'UGC'),
              h('span', { className: 'home-chip' }, 'Acquisition')
            ),
            h('a', { className: 'report-link', href: 'reports/youtube-2005.html' }, 'Read →')
          )
        )
      ),

      h('section', { className: 'home-v2__section reveal-card', style: { '--delay': '340ms' } },
        h('p', { className: 'home-v2__label' }, 'About this project'),
        h('article', { className: 'home-v2__panel' },
          h('h2', null, 'What if 20 VCs reviewed your pitch deck?'),
          h('p', null, 'Signal Ledger gives founders context for what they are building through independent persona analysis, committee-style disagreement, and evidence-first conclusions.'),
          h('div', { className: 'chip-row' },
            h('span', { className: 'home-chip' }, 'Peter Thiel'),
            h('span', { className: 'home-chip' }, 'Bill Gurley'),
            h('span', { className: 'home-chip' }, 'Reid Hoffman'),
            h('span', { className: 'home-chip' }, 'Marc Andreessen')
          )
        )
      )
    );
  }

  ReactDOM.createRoot(rootEl).render(h(App));
})();
