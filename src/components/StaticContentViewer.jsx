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
import { useState, useRef, useMemo } from 'react'
import { HTML_SECTIONS } from '../data/htmlContent'

// ── Parchment/sandal light theme — CSS vars injected into every iframe ────────
const THEME_VARS = `<style id="__ex-theme">
:root {
  /* backgrounds */
  --color-background-primary:   #fbf9e1;
  --color-background-secondary: #f2eec8;
  --color-background-info:      #ede7fb;
  --color-background-danger:    #fdecea;

  /* text */
  --color-text-primary:   #2d2a1e;
  --color-text-secondary: #5a5340;
  --color-text-tertiary:  #8c8060;
  --color-text-info:      #5b3fa6;
  --color-text-danger:    #b91c1c;

  /* borders */
  --color-border-primary:   #c8be8a;
  --color-border-secondary: #d9d09a;
  --color-border-tertiary:  #e8e2b8;
  --color-border-info:      #9b79e0;

  /* typography */
  --font-sans: 'Segoe UI', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

  /* radii */
  --border-radius-sm: 4px;
  --border-radius-md: 6px;
  --border-radius-lg: 10px;
}

/* base */
html, body { background: #fbf9e1 !important; color: #2d2a1e !important; }
body { font-family: var(--font-sans); font-size: 14px; line-height: 1.7; padding: 10px; box-sizing: border-box; }

/* outer shell/app wrappers — respect the 10px body padding */
.shell, .app { box-sizing: border-box; width: 100%; }

/* content area + individual sections */
.content, main { padding: 20px 24px !important; }
.sec { padding: 14px 16px; background: rgba(255,255,255,0.45); border-radius: var(--border-radius-md); margin-bottom: 20px; }
.card { padding: 14px 16px !important; }
.iq  { padding: 12px 16px !important; }
.analogy { padding: 14px 18px !important; }
.code, pre { padding: 14px 16px !important; }

/* scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #f2eec8; }
::-webkit-scrollbar-thumb { background: #c8be8a; border-radius: 3px; }

/* accent overrides — purple */
a { color: #6d3fc7; text-decoration: none; }
a:hover { text-decoration: underline; }

/* active nav */
.nav-item.active,
.nav-item:hover { color: #5b3fa6 !important; }
.nav-item.active { border-color: #9b79e0 !important; background: #ede7fb !important; }

/* code blocks — light card */
.code, pre, code {
  background: #eeebd0 !important;
  border: 1px solid #d9d09a !important;
  border-radius: var(--border-radius-md);
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.65;
  color: #2d2a1e !important;
}
pre { padding: 14px 16px; overflow-x: auto; white-space: pre; }

/* section labels with purple left-border */
.sec-label { color: #5b3fa6 !important; }
.sec-label::after { background: #c8be8a !important; }
.topic-oneliner { border-color: #9b79e0 !important; }
.topic-tag { background: #ede7fb !important; color: #5b3fa6 !important; border: 1px solid #c4aef5; }

/* analogy callout */
.analogy { border-color: #9b79e0 !important; background: #ede7fb !important; color: #3d2970 !important; }

/* tables */
table.ct th { color: #5b3fa6 !important; border-color: #c8be8a !important; }
table.ct td { border-color: #e8e2b8 !important; }

/* sidebar */
.sidebar, nav { background: #f2eec8 !important; border-color: #d9d09a !important; }
</style>`

// ── Inject heading IDs + scroll listener into the HTML string ─────────────────
function processHtml(raw) {
  if (!raw) return ''
  return THEME_VARS + raw
}


// ── Main ──────────────────────────────────────────────────────────────────────
export default function StaticContentViewer({ categoryId }) {
  const items = HTML_SECTIONS[categoryId] || []
  const [activeId, setActiveId] = useState(items[0]?.id)
  const iframeRef = useRef(null)

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
            onClick={() => { setActiveId(it.id); setSection(null) }}
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
            style={{ flex: 1, border: 'none', background: '#fbf9e1', height: '100%', width: '100%' }}
          />
        )}
      </div>
    </div>
  )
}
