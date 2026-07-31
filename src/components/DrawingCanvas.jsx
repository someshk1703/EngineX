/**
 * DrawingCanvas.jsx
 * Full-screen Excalidraw whiteboard for system design interviews.
 * Auto-saves to localStorage | Theme-synced | Export as PNG/SVG
 */
/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useCallback } from 'react'
import { Excalidraw, exportToBlob, exportToSvg } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'

const STORAGE_KEY = 'enginex_drawing_state'

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
  const excalidrawRef = useRef(null)
  const [savedAt, setSavedAt] = useState(null)
  const [exportMsg, setExportMsg] = useState('')
  const saveTimer = useRef(null)

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
    const api = excalidrawRef.current
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
    const api = excalidrawRef.current
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
    const api = excalidrawRef.current
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
          <button
            onClick={handleExportPng}
            style={{
              background: 'none', border: '1px solid var(--border-color)', borderRadius: 6,
              color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px 11px',
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: 1,
            }}
          >
            ↓ PNG
          </button>
          <button
            onClick={handleExportSvg}
            style={{
              background: 'none', border: '1px solid var(--border-color)', borderRadius: 6,
              color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px 11px',
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: 1,
            }}
          >
            ↓ SVG
          </button>
          <button
            onClick={handleClear}
            style={{
              background: 'none', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 6,
              color: 'rgba(255,80,80,0.8)', cursor: 'pointer', padding: '5px 11px',
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: 1,
            }}
          >
            ✕ CLEAR
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Excalidraw
          ref={excalidrawRef}
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
  )
}
