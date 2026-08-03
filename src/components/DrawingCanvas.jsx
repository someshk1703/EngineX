/**
 * DrawingCanvas.jsx
 * Full-screen Excalidraw whiteboard for system design interviews.
 * Auto-saves to localStorage | Theme-synced | Export as PNG/SVG
 */
/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useCallback } from 'react'
import { Excalidraw, exportToBlob, exportToSvg } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import { SD_QUESTIONS } from '../data/questions'

const STORAGE_KEY = 'enginex_drawing_state'
const SIDEBAR_W = 288

const DIFF_COLOR = { Medium: '#ffaa00', Hard: '#ff4444' }
const DIFF_BG    = { Medium: 'rgba(255,170,0,0.08)', Hard: 'rgba(255,68,68,0.08)' }

// ─── SD question detail panel ─────────────────────────────────────────────────
function SDQuestionDetail({ q, onClose }) {
  const [tab, setTab] = useState('overview') // overview | requirements | components | hints
  const mono = { fontFamily: 'var(--font-mono)' }
  const sectionLabel = { ...mono, fontSize: '0.65rem', letterSpacing: 1, color: 'var(--accent-cyan)', marginBottom: 8, marginTop: 16 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        <button className="btn-console" onClick={onClose} style={{ padding: '3px 8px', fontSize: '0.68rem' }}>✕</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...mono, fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</div>
          <div style={{ ...mono, fontSize: '0.62rem', color: 'var(--text-muted)' }}>{q.category}</div>
        </div>
        <span style={{ ...mono, fontSize: '0.62rem', padding: '2px 7px', borderRadius: 10, background: DIFF_BG[q.difficulty], color: DIFF_COLOR[q.difficulty], flexShrink: 0 }}>{q.difficulty}</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        {[['overview','INFO'],['requirements','REQS'],['components','ARCH'],['hints','HINTS']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: '6px 0', border: 'none', cursor: 'pointer', ...mono, fontSize: '0.6rem', letterSpacing: 1,
            background: tab === id ? 'rgba(255,204,0,0.07)' : 'transparent',
            color: tab === id ? 'var(--accent-yellow)' : 'var(--text-muted)',
            borderBottom: tab === id ? '2px solid var(--accent-yellow)' : '2px solid transparent',
          }}>{label}</button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
        {tab === 'overview' && (
          <>
            <p style={{ ...mono, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{q.description}</p>
            <div style={sectionLabel}>INTERVIEW FRAMEWORK</div>
            <p style={{ ...mono, fontSize: '0.74rem', color: 'var(--accent-green)', lineHeight: 1.7, margin: 0 }}>{q.interviewFramework}</p>
            <div style={sectionLabel}>TAGS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {q.tags.map(tag => (
                <span key={tag} style={{ ...mono, fontSize: '0.62rem', padding: '2px 7px', borderRadius: 10, background: 'rgba(0,200,255,0.08)', border: '1px solid rgba(0,200,255,0.2)', color: 'var(--accent-cyan)' }}>{tag}</span>
              ))}
            </div>
          </>
        )}

        {tab === 'requirements' && (
          <>
            <div style={sectionLabel}>FUNCTIONAL</div>
            <ul style={{ margin: 0, paddingLeft: 16, ...mono, fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {q.requirements.functional.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
            <div style={sectionLabel}>NON-FUNCTIONAL</div>
            <ul style={{ margin: 0, paddingLeft: 16, ...mono, fontSize: '0.76rem', color: 'var(--accent-green)', lineHeight: 1.8 }}>
              {q.requirements.nonFunctional.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </>
        )}

        {tab === 'components' && (
          <>
            <div style={sectionLabel}>KEY COMPONENTS</div>
            <ul style={{ margin: 0, paddingLeft: 16, ...mono, fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {q.keyComponents.map((c, i) => <li key={i} style={{ marginBottom: 6 }}>{c}</li>)}
            </ul>
          </>
        )}

        {tab === 'hints' && (
          <>
            <div style={sectionLabel}>DEEP DIVE HINTS</div>
            <ul style={{ margin: 0, paddingLeft: 16, ...mono, fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.9 }}>
              {q.hints.map((h, i) => <li key={i} style={{ marginBottom: 8 }}>{h}</li>)}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

function loadDrawingState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveDrawingState(elements, appState, files) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ elements, appState, files }))
  } catch (_e) { /* ignore parse errors */ }
}

export default function DrawingCanvas({ onBack, darkMode = true }) {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null)
  const [savedAt, setSavedAt] = useState(null)
  const [exportMsg, setExportMsg] = useState('')
  const saveTimer = useRef(null)

  // Questions sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedQ, setSelectedQ] = useState(null)

  const initialData = loadDrawingState()

  const handleChange = useCallback((elements, appState, files) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      // only persist non-deleted elements
      const toSave = elements.filter(el => !el.isDeleted)
      saveDrawingState(toSave, {
        viewBackgroundColor: appState.viewBackgroundColor,
        currentItemStrokeColor: appState.currentItemStrokeColor,
        currentItemFontFamily: appState.currentItemFontFamily,
      }, files)
      setSavedAt(new Date().toLocaleTimeString())
    }, 800)
  }, [])

  useEffect(() => () => clearTimeout(saveTimer.current), [])

  const handleExportPng = async () => {
    const api = excalidrawAPI
    if (!api) return
    try {
      const blob = await exportToBlob({
        elements: api.getSceneElements(),
        appState: { ...api.getAppState(), exportWithDarkMode: darkMode },
        files: api.getFiles(),
        mimeType: 'image/png',
        quality: 1,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `enginex-diagram-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
      setExportMsg('PNG exported!')
      setTimeout(() => setExportMsg(''), 2500)
    } catch {
      setExportMsg('Export failed')
      setTimeout(() => setExportMsg(''), 2500)
    }
  }

  const handleExportSvg = async () => {
    const api = excalidrawAPI
    if (!api) return
    try {
      const svg = await exportToSvg({
        elements: api.getSceneElements(),
        appState: { ...api.getAppState(), exportWithDarkMode: darkMode },
        files: api.getFiles(),
      })
      const serialized = new XMLSerializer().serializeToString(svg)
      const blob = new Blob([serialized], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `enginex-diagram-${Date.now()}.svg`
      a.click()
      URL.revokeObjectURL(url)
      setExportMsg('SVG exported!')
      setTimeout(() => setExportMsg(''), 2500)
    } catch {
      setExportMsg('Export failed')
      setTimeout(() => setExportMsg(''), 2500)
    }
  }

  const handleClear = () => {
    const api = excalidrawAPI
    if (!api) return
    if (window.confirm('Clear the canvas? This cannot be undone.')) {
      api.resetScene()
      localStorage.removeItem(STORAGE_KEY)
      setSavedAt(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        flexShrink: 0, flexWrap: 'wrap',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: '1px solid var(--border-color)', borderRadius: 6,
            color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px 12px',
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: 1,
          }}
        >
          ← BACK
        </button>

        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            background: 'none', border: '1px solid var(--border-color)', borderRadius: 6,
            color: sidebarOpen ? 'var(--accent-yellow)' : 'var(--text-secondary)',
            cursor: 'pointer', padding: '5px 12px',
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: 1,
          }}
          title="Toggle system design questions"
        >
          {sidebarOpen ? '◀ PROBLEMS' : '▶ PROBLEMS'}
        </button>

        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-yellow)', letterSpacing: 2 }}>
          🖊 EX-DRAW
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {exportMsg && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-green)' }}>
              ✓ {exportMsg}
            </span>
          )}
          {savedAt && !exportMsg && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', opacity: 0.6 }}>
              saved {savedAt}
            </span>
          )}
          <button onClick={handleExportPng} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px 11px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: 1 }}>↓ PNG</button>
          <button onClick={handleExportSvg} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px 11px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: 1 }}>↓ SVG</button>
          <button onClick={handleClear} style={{ background: 'none', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 6, color: 'rgba(255,80,80,0.8)', cursor: 'pointer', padding: '5px 11px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: 1 }}>✕ CLEAR</button>
        </div>
      </div>

      {/* Body: optional sidebar + canvas */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* System design questions sidebar */}
        {sidebarOpen && (
          <div style={{
            width: SIDEBAR_W, flexShrink: 0, display: 'flex', flexDirection: 'column',
            borderRight: '1px solid var(--border-color)', background: 'var(--bg-secondary)', overflow: 'hidden',
          }}>
            {selectedQ ? (
              <SDQuestionDetail q={selectedQ} onClose={() => setSelectedQ(null)} />
            ) : (
              <>
                <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: 1 }}>
                    {SD_QUESTIONS.length} PROBLEMS
                  </span>
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {SD_QUESTIONS.map(q => (
                    <button key={q.id} onClick={() => setSelectedQ(q)} style={{
                      width: '100%', textAlign: 'left', background: 'transparent',
                      border: 'none', borderBottom: '1px solid var(--border-color)',
                      padding: '10px 14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4,
                    }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>{q.title}</span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', padding: '1px 6px', borderRadius: 10, background: DIFF_BG[q.difficulty], color: DIFF_COLOR[q.difficulty] }}>{q.difficulty}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>{q.category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Canvas */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <Excalidraw
            excalidrawAPI={setExcalidrawAPI}
            theme={darkMode ? 'dark' : 'light'}
            initialData={initialData ? {
              elements: initialData.elements || [],
              appState: initialData.appState || {},
              files: initialData.files || {},
            } : undefined}
            onChange={handleChange}
            UIOptions={{
              canvasActions: {
                saveToActiveFile: false,
                loadScene: true,
                export: false,
                toggleTheme: false,
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
