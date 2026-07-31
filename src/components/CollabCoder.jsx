import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { DSA_QUESTIONS, JAVA_QUESTIONS } from '../data/questions'

const COLLAB_URL_KEY = 'enginex_collab_url'
const DEFAULT_COLLAB_URL = 'https://crdt-client.vercel.app'
const EXECUTE_URL = 'https://crdt-client.vercel.app/api/execute'
const SIDEBAR_W = 288

const ALL_QUESTIONS = [
  ...DSA_QUESTIONS.map(q => ({ ...q, _cat: 'DSA' })),
  ...JAVA_QUESTIONS.map(q => ({ ...q, _cat: 'Java' })),
]

const DIFF_COLOR = { Easy: '#00ff66', Medium: '#ffaa00', Hard: '#ff4444' }
const DIFF_BG    = { Easy: 'rgba(0,255,102,0.08)', Medium: 'rgba(255,170,0,0.08)', Hard: 'rgba(255,68,68,0.08)' }

// Pass session tokens in iframe URL hash so Supabase auto-authenticates on the CRDT side
// (requires both apps to share the same Supabase project)
function buildIframeUrl(base, session) {
  if (!session?.access_token) return base
  const hash = [
    `access_token=${encodeURIComponent(session.access_token)}`,
    `refresh_token=${encodeURIComponent(session.refresh_token ?? '')}`,
    `expires_in=${session.expires_in ?? 3600}`,
    `token_type=bearer`,
  ].join('&')
  return `${base}#${hash}`
}

function loadCollabUrl() {
  try { return localStorage.getItem(COLLAB_URL_KEY) || DEFAULT_COLLAB_URL } catch { return DEFAULT_COLLAB_URL }
}

// ─── Questions sidebar ────────────────────────────────────────────────────────

function QuestionList({ questions, onSelect, selected }) {
  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {questions.map(q => (
        <button
          key={q.id}
          onClick={() => onSelect(q)}
          style={{
            width: '100%', textAlign: 'left', background: selected?.id === q.id ? 'rgba(0,255,102,0.07)' : 'transparent',
            border: 'none', borderBottom: '1px solid var(--border-color)', padding: '10px 14px',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4,
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {q.title}
          </span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.62rem', padding: '1px 6px', borderRadius: 10,
              background: DIFF_BG[q.difficulty], color: DIFF_COLOR[q.difficulty], border: `1px solid ${DIFF_COLOR[q.difficulty]}44`,
            }}>{q.difficulty}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', padding: '1px 0' }}>
              {q.topic}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}

// ─── Question detail panel ────────────────────────────────────────────────────

function QuestionDetail({ q, onClose, session }) {
  const [showHints, setShowHints] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [execLang, setExecLang] = useState('javascript')
  const [executing, setExecuting] = useState(false)
  const [execResult, setExecResult] = useState(null)

  const isDSA = q._cat === 'DSA'

  const runCode = async (code) => {
    if (!session?.access_token) {
      setExecResult({ error: 'Sign in with GitHub first — the executor requires authentication.' })
      return
    }
    setExecuting(true)
    setExecResult(null)
    try {
      const res = await fetch(EXECUTE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ language: execLang, code }),
      })
      const data = await res.json()
      setExecResult(data)
    } catch (err) {
      setExecResult({ error: String(err) })
    } finally {
      setExecuting(false)
    }
  }

  const codeToRun = isDSA ? q.solution?.code : q.codeExample

  const mono = { fontFamily: 'var(--font-mono)' }
  const sectionLabel = { ...mono, fontSize: '0.65rem', letterSpacing: 1, color: 'var(--accent-cyan)', marginBottom: 8, marginTop: 20 }
  const codeBlock = {
    background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 6,
    padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
    color: 'var(--text-primary)', whiteSpace: 'pre-wrap', overflowX: 'auto', lineHeight: 1.6,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Detail header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        <button className="btn-console" onClick={onClose} style={{ padding: '4px 10px', fontSize: '0.72rem' }}>← EDITOR</button>
        <span style={{ ...mono, fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', flex: 1 }}>{q.title}</span>
        <span style={{ ...mono, fontSize: '0.68rem', padding: '2px 8px', borderRadius: 12, background: DIFF_BG[q.difficulty], color: DIFF_COLOR[q.difficulty] }}>
          {q.difficulty}
        </span>
        <span style={{ ...mono, fontSize: '0.68rem', color: 'var(--text-muted)' }}>{q.topic}</span>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {/* DSA question */}
        {isDSA && (<>
          <div style={sectionLabel}>PROBLEM</div>
          <p style={{ ...mono, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{q.description}</p>

          {q.examples?.length > 0 && (<>
            <div style={sectionLabel}>EXAMPLES</div>
            {q.examples.map((ex, i) => (
              <div key={i} style={{ ...codeBlock, marginBottom: 8 }}>
                <div><span style={{ color: 'var(--accent-cyan)' }}>Input:  </span>{ex.input}</div>
                <div><span style={{ color: 'var(--accent-green)' }}>Output: </span>{ex.output}</div>
                {ex.explanation && <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>{ex.explanation}</div>}
              </div>
            ))}
          </>)}

          {q.constraints?.length > 0 && (<>
            <div style={sectionLabel}>CONSTRAINTS</div>
            <ul style={{ margin: 0, paddingLeft: 18, ...mono, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {q.constraints.map((c, i) => <li key={i} style={{ marginBottom: 4 }}>{c}</li>)}
            </ul>
          </>)}

          {q.hints?.length > 0 && (<>
            <button className="btn-console" onClick={() => setShowHints(h => !h)} style={{ marginTop: 18, padding: '5px 12px', fontSize: '0.72rem' }}>
              {showHints ? '▼' : '▶'} HINTS ({q.hints.length})
            </button>
            {showHints && (
              <ol style={{ margin: '10px 0 0', paddingLeft: 22, ...mono, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {q.hints.map((h, i) => <li key={i} style={{ marginBottom: 6 }}>{h}</li>)}
              </ol>
            )}
          </>)}

          {q.solution && (<>
            <button className="btn-console" onClick={() => setShowSolution(s => !s)} style={{ marginTop: 12, padding: '5px 12px', fontSize: '0.72rem' }}>
              {showSolution ? '▼' : '▶'} SOLUTION
            </button>
            {showSolution && (<>
              <p style={{ ...mono, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 10 }}>{q.solution.approach}</p>
              {q.solution.complexity && (
                <div style={{ ...mono, fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                  Time: {q.solution.complexity.time} · Space: {q.solution.complexity.space}
                </div>
              )}
              <pre style={codeBlock}>{q.solution.code}</pre>
            </>)}
          </>)}
        </>)}

        {/* Java Q&A question */}
        {!isDSA && (<>
          <div style={sectionLabel}>QUESTION</div>
          <p style={{ ...mono, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{q.question}</p>

          <div style={sectionLabel}>ANSWER</div>
          <div style={{ ...mono, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{q.answer}</div>

          {q.keyPoints?.length > 0 && (<>
            <div style={sectionLabel}>KEY POINTS</div>
            <ul style={{ margin: 0, paddingLeft: 18, ...mono, fontSize: '0.78rem', color: 'var(--accent-green)' }}>
              {q.keyPoints.map((kp, i) => <li key={i} style={{ marginBottom: 4 }}>{kp}</li>)}
            </ul>
          </>)}

          {q.codeExample && (<>
            <div style={sectionLabel}>CODE EXAMPLE</div>
            <pre style={codeBlock}>{q.codeExample}</pre>
          </>)}
        </>)}

        {/* ── Run section ──────────────────────────────────────────── */}
        {codeToRun && (
          <div style={{ marginTop: 20, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ ...mono, fontSize: '0.65rem', letterSpacing: 1, color: 'var(--accent-cyan)' }}>RUN CODE</span>
              <select
                value={execLang}
                onChange={e => setExecLang(e.target.value)}
                style={{
                  background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 4,
                  color: 'var(--text-primary)', ...mono, fontSize: '0.75rem', padding: '3px 8px', cursor: 'pointer',
                }}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
              <button
                className="btn-console btn-console-success"
                onClick={() => runCode(codeToRun)}
                disabled={executing}
                style={{ padding: '5px 14px', fontSize: '0.75rem' }}
              >
                {executing ? '⏳ Running…' : '▶ Run'}
              </button>
            </div>

            {execResult && (
              <div style={{ ...codeBlock, marginTop: 8, color: execResult.error ? 'var(--accent-red)' : 'var(--accent-green)', position: 'relative' }}>
                <button
                  onClick={() => setExecResult(null)}
                  style={{ position: 'absolute', top: 6, right: 8, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}
                >✕</button>
                {execResult.error
                  ? `Error: ${execResult.error}`
                  : (execResult.stdout || execResult.output || JSON.stringify(execResult, null, 2))}
                {execResult.stderr && <div style={{ color: 'var(--accent-red)', marginTop: 6 }}>{execResult.stderr}</div>}
                {execResult.remaining !== undefined && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginTop: 8 }}>
                    Daily executions remaining: {execResult.remaining}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CollabCoder({ onBack }) {
  const [url, setUrl] = useState(loadCollabUrl)
  const [editingUrl, setEditingUrl] = useState(false)
  const [draftUrl, setDraftUrl] = useState(loadCollabUrl)
  const [iframeKey, setIframeKey] = useState(0)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [session, setSession] = useState(null)

  // Questions panel
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [qFilter, setQFilter] = useState('DSA')
  const [selectedQ, setSelectedQ] = useState(null)

  // Sync session from EngineX Supabase for auto sign-in + executor auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

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

  const refresh = () => { setSelectedQ(null); setIframeKey(k => k + 1) }

  const iframeSrc = buildIframeUrl(url, session)
  const questions = ALL_QUESTIONS.filter(q => q._cat === qFilter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>

      {/* ── Toolbar ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        flexShrink: 0, flexWrap: 'wrap',
      }}>
        <button className="btn-console" onClick={onBack} style={{ padding: '5px 12px', fontSize: '0.78rem' }}>← BACK</button>

        <button
          className="btn-console"
          onClick={() => setSidebarOpen(o => !o)}
          style={{ padding: '5px 10px', fontSize: '0.72rem' }}
          title="Toggle questions panel"
        >
          {sidebarOpen ? '◀ QUESTIONS' : '▶ QUESTIONS'}
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
          }}>RGA CRDT</span>
        </div>

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

        {session && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: 20, background: 'rgba(0,200,255,0.08)', border: '1px solid rgba(0,200,255,0.3)' }}>
            ✓ AUTO SIGNED IN
          </span>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
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
            <button className="btn-console" onClick={() => { setDraftUrl(url); setEditingUrl(true) }} style={{ padding: '5px 10px', fontSize: '0.75rem' }} title="Change CRDT server URL">
              ⚙ {url}
            </button>
          )}
          <button className="btn-console" onClick={refresh} style={{ padding: '5px 10px', fontSize: '0.75rem' }} title="Reload">↺ RELOAD</button>
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn-console" style={{ padding: '5px 10px', fontSize: '0.75rem', textDecoration: 'none' }}>↗ POP OUT</a>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Questions sidebar */}
        {sidebarOpen && (
          <div style={{
            width: SIDEBAR_W, flexShrink: 0, display: 'flex', flexDirection: 'column',
            borderRight: '1px solid var(--border-color)', background: 'var(--bg-secondary)', overflow: 'hidden',
          }}>
            {/* Category tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
              {['DSA', 'Java'].map(cat => (
                <button
                  key={cat}
                  onClick={() => { setQFilter(cat); setSelectedQ(null) }}
                  style={{
                    flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: 1,
                    background: qFilter === cat ? 'rgba(0,255,102,0.07)' : 'transparent',
                    color: qFilter === cat ? 'var(--accent-green)' : 'var(--text-muted)',
                    borderBottom: qFilter === cat ? '2px solid var(--accent-green)' : '2px solid transparent',
                  }}
                >{cat}</button>
              ))}
            </div>
            <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: 1 }}>
                {questions.length} PROBLEMS
              </span>
            </div>
            <QuestionList questions={questions} onSelect={setSelectedQ} selected={selectedQ} />
          </div>
        )}

        {/* Main: question detail or iframe */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {selectedQ ? (
            <QuestionDetail q={selectedQ} onClose={() => setSelectedQ(null)} session={session} />
          ) : status === 'error' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20, padding: 32 }}>
              <div style={{ fontSize: '2.5rem' }}>⚡</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                CRDT Server Not Running
              </div>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 480, lineHeight: 1.7, fontSize: '0.9rem' }}>
                The collaborative editor at{' '}
                <a href="https://crdt-client.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)' }}>crdt-client.vercel.app</a>{' '}
                could not be reached. Check your connection or change the URL below.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-console btn-console-success" onClick={refresh}>↺ RETRY CONNECTION</button>
                <button className="btn-console" onClick={() => { setDraftUrl(url); setEditingUrl(true) }}>⚙ CHANGE URL</button>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Currently pointing to: <span style={{ color: 'var(--accent-cyan)' }}>{url}</span>
              </p>
            </div>
          ) : (
            <iframe
              key={iframeKey}
              src={iframeSrc}
              title="Collab Coder — CRDT Collaborative Editor"
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="clipboard-read; clipboard-write"
              onLoad={() => setStatus('ready')}
              onError={() => setStatus('error')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
