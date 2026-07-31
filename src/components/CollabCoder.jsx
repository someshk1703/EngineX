import { useState, useEffect } from 'react'

const COLLAB_URL_KEY = 'enginex_collab_url'
const DEFAULT_COLLAB_URL = 'https://crdt-client.vercel.app'

function loadCollabUrl() {
  try { return localStorage.getItem(COLLAB_URL_KEY) || DEFAULT_COLLAB_URL } catch { return DEFAULT_COLLAB_URL }
}

export default function CollabCoder({ onBack }) {
  const [url, setUrl] = useState(loadCollabUrl)
  const [editingUrl, setEditingUrl] = useState(false)
  const [draftUrl, setDraftUrl] = useState(loadCollabUrl)
  const [iframeKey, setIframeKey] = useState(0)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  // Probe whether the CRDT server is reachable
  useEffect(() => {
    setStatus('loading')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    fetch(url, { signal: controller.signal, mode: 'no-cors' })
      .then(() => setStatus('ready'))
      .catch(() => setStatus('error'))
      .finally(() => clearTimeout(timeout))

    return () => { controller.abort(); clearTimeout(timeout) }
  }, [url, iframeKey])

  const saveUrl = () => {
    const trimmed = draftUrl.trim().replace(/\/$/, '')
    localStorage.setItem(COLLAB_URL_KEY, trimmed)
    setUrl(trimmed)
    setEditingUrl(false)
    setIframeKey(k => k + 1)
  }

  const refresh = () => setIframeKey(k => k + 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        <button
          className="btn-console"
          onClick={onBack}
          style={{ padding: '5px 12px', fontSize: '0.78rem' }}
        >
          ← BACK
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-green)', letterSpacing: 1 }}>
            👥 COLLAB CODER
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: 1,
            padding: '2px 8px', borderRadius: 20,
            background: 'rgba(0,255,102,0.08)', border: '1px solid rgba(0,255,102,0.3)',
            color: 'var(--accent-green)',
          }}>
            RGA CRDT
          </span>
        </div>

        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: status === 'ready' ? 'var(--accent-green)' : status === 'loading' ? 'var(--accent-yellow)' : 'var(--accent-red)',
            boxShadow: status === 'ready' ? '0 0 6px var(--accent-green)' : 'none',
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {status === 'ready' ? 'SERVER ONLINE' : status === 'loading' ? 'CONNECTING…' : 'SERVER OFFLINE'}
          </span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* URL editor */}
          {editingUrl ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                value={draftUrl}
                onChange={e => setDraftUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveUrl(); if (e.key === 'Escape') setEditingUrl(false) }}
                autoFocus
                style={{
                  background: 'var(--bg-primary)', border: '1px solid var(--accent-cyan)',
                  borderRadius: 4, padding: '4px 10px', color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.78rem', width: 220, outline: 'none',
                }}
              />
              <button className="btn-console btn-console-success" onClick={saveUrl} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>✓</button>
              <button className="btn-console" onClick={() => setEditingUrl(false)} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>✕</button>
            </div>
          ) : (
            <button
              className="btn-console"
              onClick={() => { setDraftUrl(url); setEditingUrl(true) }}
              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
              title="Change CRDT server URL"
            >
              ⚙ {url}
            </button>
          )}
          <button
            className="btn-console"
            onClick={refresh}
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            title="Reload"
          >
            ↺ RELOAD
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-console"
            style={{ padding: '5px 10px', fontSize: '0.75rem', textDecoration: 'none' }}
          >
            ↗ POP OUT
          </a>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {status === 'error' ? (
          /* Server offline splash */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', gap: 20, padding: 32,
          }}>
            <div style={{ fontSize: '2.5rem' }}>⚡</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              CRDT Server Not Running
            </div>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 480, lineHeight: 1.7, fontSize: '0.9rem' }}>
              The collaborative editor at{' '}
              <a href="https://crdt-client.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)' }}>crdt-client.vercel.app</a>{' '}
              could not be reached. Check your connection or change the URL below.
            </p>

            <a
              href="https://crdt-client.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-console btn-console-success"
              style={{ textDecoration: 'none' }}
            >
              ↗ OPEN IN NEW TAB
            </a>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-console btn-console-success" onClick={refresh}>
                ↺ RETRY CONNECTION
              </button>
              <button
                className="btn-console"
                onClick={() => { setDraftUrl(url); setEditingUrl(true) }}
              >
                ⚙ CHANGE URL
              </button>
            </div>

            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Currently pointing to: <span style={{ color: 'var(--accent-cyan)' }}>{url}</span>
            </p>
          </div>
        ) : (
          /* iframe embed */
          <iframe
            key={iframeKey}
            src={url}
            title="Collab Coder — CRDT Collaborative Editor"
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="clipboard-read; clipboard-write"
            onLoad={() => setStatus('ready')}
            onError={() => setStatus('error')}
          />
        )}
      </div>
    </div>
  )
}
