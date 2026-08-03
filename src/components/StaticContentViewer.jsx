/**
 * StaticContentViewer.jsx
 * Renders pre-written HTML theory files per category.
 * Features:
 *   • Scrollable topic tab bar (one tab per HTML file)
 *   • Auto-generated section TOC from h2/h3 headings
 *   • iframe rendering (preserves each HTML file's own CSS/JS)
 *   • postMessage scroll-to-section bridge
 *   • Read-time estimate
 */
import { useState, useRef, useMemo, useEffect } from 'react'
import { HTML_SECTIONS } from '../data/htmlContent'

// ── Dark theme matching EngineX palette — injected into every iframe ──────────
const THEME_VARS = `<style id="__ex-theme">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
:root {
  /* backgrounds */
  --color-background-primary:   #0F1115;
  --color-background-secondary: #171A20;
  --color-background-tertiary:  #1E2128;
  --color-background-info:      rgba(76,130,255,0.08);
  --color-background-danger:    rgba(255,68,68,0.08);

  /* text */
  --color-text-primary:   #E8E6E1;
  --color-text-secondary: #8B8F98;
  --color-text-tertiary:  #555B67;
  --color-text-info:      #4C82FF;
  --color-text-danger:    #ff4444;

  /* borders */
  --color-border-primary:   #262A32;
  --color-border-secondary: #2E333D;
  --color-border-tertiary:  #1E2128;
  --color-border-info:      rgba(76,130,255,0.35);

  /* accents */
  --accent-cyan:   #4C82FF;
  --accent-yellow: #FFCC00;
  --accent-green:  #39D353;
  --accent-red:    #ff4444;

  /* typography */
  --font-sans: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

  /* radii */
  --border-radius-sm: 4px;
  --border-radius-md: 6px;
  --border-radius-lg: 10px;
}

/* base */
html, body { background: #0F1115 !important; color: #E8E6E1 !important; }
body { font-family: var(--font-sans); font-size: 14px; line-height: 1.7; padding: 10px; box-sizing: border-box; }

/* outer shell/app wrappers */
.shell, .app { box-sizing: border-box; width: 100%; }

/* content area + individual sections */
.content, main { padding: 20px 24px !important; }
.sec { padding: 14px 16px; background: #171A20; border: 1px solid #262A32; border-radius: var(--border-radius-md); margin-bottom: 20px; }
.card { padding: 14px 16px !important; background: #171A20 !important; border: 1px solid #262A32 !important; border-radius: var(--border-radius-md) !important; }
.iq  { padding: 12px 16px !important; background: rgba(76,130,255,0.06) !important; border: 1px solid rgba(76,130,255,0.2) !important; border-radius: var(--border-radius-md) !important; }
.analogy { padding: 14px 18px !important; }
.code, pre { padding: 14px 16px !important; }

/* scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #0F1115; }
::-webkit-scrollbar-thumb { background: #262A32; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #4C82FF; }

/* links */
a { color: #4C82FF; text-decoration: none; }
a:hover { text-decoration: underline; }

/* active nav */
.nav-item.active,
.nav-item:hover { color: #4C82FF !important; }
.nav-item.active { border-color: rgba(76,130,255,0.4) !important; background: rgba(76,130,255,0.08) !important; }

/* code blocks */
.code, pre, code {
  background: #1E2128 !important;
  border: 1px solid #262A32 !important;
  border-radius: var(--border-radius-md);
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.65;
  color: #E8E6E1 !important;
}
pre { padding: 14px 16px; overflow-x: auto; white-space: pre; }

/* section labels */
.sec-label { color: #4C82FF !important; }
.sec-label::after { background: #262A32 !important; }
.topic-oneliner { border-color: rgba(76,130,255,0.3) !important; color: #8B8F98 !important; }
.topic-tag { background: rgba(76,130,255,0.1) !important; color: #4C82FF !important; border: 1px solid rgba(76,130,255,0.25) !important; }

/* analogy callout */
.analogy { border-color: rgba(76,130,255,0.3) !important; background: rgba(76,130,255,0.06) !important; color: #8B8F98 !important; }

/* tables */
table, table.ct { border-collapse: collapse; width: 100%; }
table.ct th { color: #4C82FF !important; border-color: #262A32 !important; background: #171A20 !important; }
table.ct td { border-color: #1E2128 !important; color: #8B8F98 !important; }
table th, table td { border: 1px solid #262A32 !important; padding: 8px 12px; }
table th { background: #171A20 !important; color: #4C82FF !important; font-weight: 600; }
table tr:hover td { background: rgba(255,255,255,0.02) !important; }

/* sidebar / nav */
.sidebar, nav { background: #171A20 !important; border-color: #262A32 !important; }

/* headings */
h1, h2, h3, h4, h5, h6 { color: #E8E6E1 !important; }
h3 { color: #FFCC00 !important; }

/* paragraph and list text */
p, li { color: #8B8F98 !important; }
li strong, p strong, b { color: #E8E6E1 !important; }

/* inline code */
code:not(pre code) {
  background: rgba(76,130,255,0.12) !important;
  color: #4C82FF !important;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 12px;
  border: 1px solid rgba(76,130,255,0.2) !important;
}

/* badges / tags */
.tag-blue  { background: rgba(76,130,255,0.15) !important; color: #4C82FF !important; }
.tag-green { background: rgba(57,211,83,0.12) !important; color: #39D353 !important; }
.tag-warn  { background: rgba(255,204,0,0.12) !important; color: #FFCC00 !important; }
.tag-red   { background: rgba(255,68,68,0.12) !important; color: #ff4444 !important; }
.diff-badge { border: none !important; }

/* pattern / practice / interview cards */
.pattern-card, .practice-card, .interview-card, .smell-card {
  background: #171A20 !important;
  border: 1px solid #262A32 !important;
  border-radius: var(--border-radius-md) !important;
}
.interview-card { border-left: 3px solid rgba(76,130,255,0.4) !important; }
.pattern-name { color: #FFCC00 !important; font-weight: 600; }
.pattern-trigger { color: #4C82FF !important; font-style: italic; }
.smell-if { color: #555B67 !important; font-size: 11px; }
.smell-then { color: #E8E6E1 !important; font-weight: 500; }

/* complexity table */
.complexity-table th { background: #1E2128 !important; color: #4C82FF !important; border-bottom: 1px solid #262A32 !important; }
.complexity-table td { border-bottom: 1px solid #1E2128 !important; color: #8B8F98 !important; }
.complexity-table td:nth-child(2) { color: #4C82FF !important; }

/* topic nav buttons */
.topic-btn { background: #171A20 !important; color: #8B8F98 !important; border: 1px solid #262A32 !important; }
.topic-btn:hover { background: #1E2128 !important; color: #E8E6E1 !important; }
.topic-btn.active { background: rgba(76,130,255,0.1) !important; color: #4C82FF !important; border-color: rgba(76,130,255,0.35) !important; }

/* section tabs */
.sec-btn { color: #555B67 !important; }
.sec-btn:hover { color: #8B8F98 !important; background: #1E2128 !important; }
.sec-btn.active { color: #E8E6E1 !important; background: #1E2128 !important; border-color: #262A32 !important; }

/* topic header */
.topic-title { color: #E8E6E1 !important; }
.topic-subtitle { color: #555B67 !important; }

/* content area text overrides */
.content-area h3 { color: #FFCC00 !important; }
.content-area h4 { color: #E8E6E1 !important; }
.content-area p  { color: #8B8F98 !important; }
.content-area li { color: #8B8F98 !important; }
.content-area li strong { color: #E8E6E1 !important; }
</style>`

// ── sendPrompt bridge — injected into every iframe ────────────────────────────
const SEND_PROMPT_BRIDGE = `<script>
(function(){
  // Define sendPrompt so inline onclick="sendPrompt(...)" calls in the HTML work
  window.sendPrompt = function(question) {
    window.parent.postMessage({ type: 'enginex-ask-bot', question: question }, '*');
  };
  // Also intercept any element with data-ask attribute on click
  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-ask]');
    if (el) { window.sendPrompt(el.getAttribute('data-ask')); }
  });
})();
<\/script>`

// ── Inject theme + sendPrompt bridge ─────────────────────────────────────────
function processHtml(raw) {
  if (!raw) return ''
  return THEME_VARS + SEND_PROMPT_BRIDGE + raw
}


// ── Main ──────────────────────────────────────────────────────────────────────
export default function StaticContentViewer({ categoryId, onAskBot }) {
  const items = HTML_SECTIONS[categoryId] || []
  const [activeId, setActiveId] = useState(items[0]?.id)
  const iframeRef = useRef(null)

  // Listen for sendPrompt messages from the iframe
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'enginex-ask-bot' && e.data.question) {
        onAskBot?.(e.data.question)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onAskBot])

  const item = items.find(i => i.id === activeId) || items[0]

  const { html, readTime } = useMemo(() => {
    if (!item?.html) return { html: '', readTime: 0 }
    const html  = processHtml(item.html)
    const words = item.html.replace(/<[^>]+>/g, '').split(/\s+/).length
    return { html, readTime: Math.max(1, Math.round(words / 200)) }
  }, [item?.id]) // eslint-disable-line

  if (!items.length) return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>📭</div>
      <div>No theory content for this category yet.</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', minHeight: 520, border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>

      {/* ── Topic tabs ── */}
      <div style={{ display: 'flex', overflowX: 'auto', flexShrink: 0, background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', scrollbarWidth: 'none' }}>
        {items.map(it => (
          <button
            key={it.id}
            onClick={() => { setActiveId(it.id) }}
            style={{
              background:   activeId === it.id ? 'rgba(0,212,255,0.07)' : 'none',
              color:        activeId === it.id ? 'var(--accent-cyan)'   : 'var(--text-secondary)',
              borderBottom: `2px solid ${activeId === it.id ? 'var(--accent-cyan)' : 'transparent'}`,
              border: 'none', outline: 'none', padding: '10px 16px',
              fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
              cursor: 'pointer', fontWeight: activeId === it.id ? 600 : 400,
              whiteSpace: 'nowrap', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: '1rem' }}>{it.icon}</span>
            <span>{it.title}</span>
          </button>
        ))}
      </div>

      {/* ── Meta bar ── */}
      {item && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flexShrink: 0, padding: '6px 14px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
          {item.tags.map(t => <span key={t} className="tech-tag">{t}</span>)}
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>~{readTime} min read</span>
        </div>
      )}

      {/* ── Content area ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {item && (
          <iframe
            key={item.id}
            ref={iframeRef}
            srcDoc={html}
            title={item.title}
            sandbox="allow-scripts allow-same-origin"
            style={{ flex: 1, border: 'none', background: '#0F1115', height: '100%', width: '100%' }}
          />
        )}
      </div>
    </div>
  )
}
