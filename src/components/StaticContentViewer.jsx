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

// ── Inject heading IDs + scroll listener into the HTML string ─────────────────
function processHtml(raw) {
  if (!raw) return ''
  let idx = 0
  const withIds = raw.replace(/<(h[23])(\s[^>]*)?>/gi, (match, tag, attrs) => {
    attrs = attrs || ''
    if (/\bid=/i.test(attrs)) return match
    return `<${tag}${attrs} id="ex-h${idx++}">`
  })
  const bridge = `<script>window.addEventListener('message',function(e){if(e.data&&e.data._ex==='scroll'){var el=document.getElementById(e.data.id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}});</script>`
  return withIds.includes('</body>') ? withIds.replace('</body>', bridge + '</body>') : withIds + bridge
}

// ── Parse h2/h3 headings from raw HTML for the TOC ───────────────────────────
function extractHeadings(raw) {
  if (!raw) return []
  const out = []
  let ai = 0
  const re = /<(h[23])(\s[^>]*)?>([^]*?)<\/h[23]>/gi
  let m
  while ((m = re.exec(raw)) !== null) {
    const level   = m[1].toUpperCase()
    const attrs   = m[2] || ''
    const text    = m[3].replace(/<[^>]+>/g, '').trim()
    const idMatch = attrs.match(/id="([^"]+)"/)
    const id      = idMatch ? idMatch[1] : `ex-h${ai}`
    if (!idMatch) ai++
    if (text.length > 0 && text.length < 120) out.push({ id, label: text.slice(0, 72), level })
  }
  return out
}

// ── Section TOC sidebar ───────────────────────────────────────────────────────
function SectionNav({ headings, active, onSelect }) {
  if (!headings.length) return null
  return (
    <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid var(--border-color)', overflowY: 'auto', background: 'var(--bg-secondary)' }}>
      <div style={{ padding: '10px 12px 6px', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.09em' }}>
        SECTIONS
      </div>
      {headings.map(h => (
        <button
          key={h.id}
          onClick={() => onSelect(h.id)}
          style={{
            display: 'block', width: '100%', textAlign: 'left', border: 'none', outline: 'none',
            background: active === h.id ? 'rgba(0,212,255,0.06)' : 'none',
            color:      active === h.id ? 'var(--accent-cyan)'   : 'var(--text-muted)',
            borderLeft: `2px solid ${active === h.id ? 'var(--accent-cyan)' : 'transparent'}`,
            padding: `5px 12px 5px ${h.level === 'H3' ? 24 : 12}px`,
            fontSize: '0.73rem', cursor: 'pointer', lineHeight: 1.45,
            fontFamily: 'var(--font-sans)', transition: 'color 0.12s',
          }}
          onMouseEnter={e => { if (active !== h.id) e.currentTarget.style.color = 'var(--text-secondary)' }}
          onMouseLeave={e => { if (active !== h.id) e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          {h.label}
        </button>
      ))}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function StaticContentViewer({ categoryId }) {
  const items = HTML_SECTIONS[categoryId] || []
  const [activeId, setActiveId]       = useState(items[0]?.id)
  const [activeSection, setSection]   = useState(null)
  const iframeRef = useRef(null)

  const item = items.find(i => i.id === activeId) || items[0]

  const { html, headings, readTime } = useMemo(() => {
    if (!item?.html) return { html: '', headings: [], readTime: 0 }
    const html     = processHtml(item.html)
    const headings = extractHeadings(item.html)
    const words    = item.html.replace(/<[^>]+>/g, '').split(/\s+/).length
    return { html, headings, readTime: Math.max(1, Math.round(words / 200)) }
  }, [item?.id]) // eslint-disable-line

  const scrollTo = (id) => {
    setSection(id)
    iframeRef.current?.contentWindow?.postMessage({ _ex: 'scroll', id }, '*')
  }

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
        <SectionNav headings={headings} active={activeSection} onSelect={scrollTo} />
        {item && (
          <iframe
            key={item.id}
            ref={iframeRef}
            srcDoc={html}
            title={item.title}
            sandbox="allow-scripts allow-same-origin"
            style={{ flex: 1, border: 'none', background: '#fff', height: '100%', width: '100%' }}
          />
        )}
      </div>
    </div>
  )
}
