/**
 * InterviewWhiteboard.jsx
 * Blank coding canvas — no compiler, real interview feel.
 * Language tabs | Line numbers | Timer | Scratch pad | Auto-save
 */
import { useState, useEffect, useRef } from 'react'

const store = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
}

const LANGUAGES = ['Java', 'JavaScript', 'Python', 'Pseudocode', 'SQL']

const STARTERS = {
  Java:         `// Java — Whiteboard Mode\n// No compiler. Think out loud.\n\nclass Solution {\n    public int solve(int[] nums) {\n        // your approach here\n        \n    }\n}\n`,
  JavaScript:   `// JavaScript — Whiteboard Mode\n\nfunction solve(nums) {\n    // your approach here\n    \n}\n`,
  Python:       `# Python — Whiteboard Mode\n\ndef solve(nums):\n    # your approach here\n    pass\n`,
  Pseudocode:   `// Pseudocode — Think clearly first\n\nFUNCTION solve(input):\n    // step 1:\n    // step 2:\n    RETURN result\n`,
  SQL:          `-- SQL — Whiteboard Mode\n\nSELECT column\nFROM table\nWHERE condition\nORDER BY column;\n`,
}

function useTimer() {
  const [secs, setSecs] = useState(0)
  const [on, setOn]     = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (on) ref.current = setInterval(() => setSecs(s => s + 1), 1000)
    else clearInterval(ref.current)
    return () => clearInterval(ref.current)
  }, [on])
  const fmt = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`
  return { display: fmt(secs), on, secs, start: () => setOn(true), pause: () => setOn(false), reset: () => { setOn(false); setSecs(0) } }
}

function LineNumbers({ code, fontSize }) {
  const n = (code.match(/\n/g) || []).length + 1
  return (
    <div style={{ width: 42, flexShrink: 0, textAlign: 'right', paddingRight: 10, paddingTop: 14, color: 'var(--text-muted)', fontSize, lineHeight: '1.6', fontFamily: 'var(--font-mono)', userSelect: 'none', borderRight: '1px solid var(--border-color)' }}>
      {Array.from({ length: n }, (_, i) => <div key={i}>{i+1}</div>)}
    </div>
  )
}

export default function InterviewWhiteboard({ questionId = 'default', question = '' }) {
  const key   = `enginex_wb_${questionId}`
  const saved = store.get(key) || {}
  const [lang, setLang]         = useState(saved.lang || 'Java')
  const [code, setCode]         = useState(saved.code ?? STARTERS['Java'])
  const [notes, setNotes]       = useState(saved.notes || '')
  const [fs, setFs]             = useState(14)
  const [showNotes, setShowNotes] = useState(true)
  const [savedAt, setSavedAt]   = useState(null)
  const timer = useTimer()
  const taRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => { store.set(key, { lang, code, notes }); setSavedAt(new Date().toLocaleTimeString()) }, 800)
    return () => clearTimeout(t)
  }, [lang, code, notes, key])

  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return
    e.preventDefault()
    const ta = taRef.current, s = ta.selectionStart, en = ta.selectionEnd
    const next = code.slice(0,s) + '    ' + code.slice(en)
    setCode(next)
    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s+4 })
  }

  const changeLang = l => { setLang(l); setCode(STARTERS[l]) }
  const reset = () => { if (!window.confirm('Clear whiteboard?')) return; setCode(STARTERS[lang]); setNotes(''); timer.reset() }
  const tc = timer.secs > 2700 ? 'var(--accent-red)' : timer.secs > 1500 ? 'var(--accent-yellow)' : 'var(--accent-green)'

  const btn = { background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: 4, padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-mono)', transition: 'all 0.15s' }

  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 2, background: 'var(--bg-primary)', borderRadius: 6, padding: 2 }}>
          {LANGUAGES.map(l => (
            <button key={l} onClick={() => changeLang(l)} style={{ background: lang===l ? 'rgba(0,212,255,0.12)' : 'none', color: lang===l ? 'var(--accent-cyan)' : 'var(--text-muted)', border: lang===l ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent', borderRadius: 4, padding: '3px 10px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: lang===l ? 600 : 400, fontFamily: 'var(--font-mono)', transition: 'all 0.15s' }}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => setFs(f => Math.max(11,f-1))} style={btn}>A−</button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', width: 22, textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{fs}</span>
          <button onClick={() => setFs(f => Math.min(20,f+1))} style={btn}>A+</button>
        </div>
        <button onClick={() => setShowNotes(n => !n)} style={{ ...btn, color: showNotes ? 'var(--accent-cyan)' : 'var(--text-muted)', borderColor: showNotes ? 'rgba(0,212,255,0.35)' : 'var(--border-color)' }}>📋 Notes</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-primary)', borderRadius: 6, padding: '3px 8px', border: '1px solid var(--border-color)' }}>
          <span style={{ color: tc, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', minWidth: 42 }}>{timer.display}</span>
          <button onClick={timer.on ? timer.pause : timer.start} style={{ ...btn, padding: '1px 6px' }}>{timer.on ? '⏸' : '▶'}</button>
          <button onClick={timer.reset} style={{ ...btn, padding: '1px 6px' }}>↺</button>
        </div>
        <button onClick={reset} style={{ ...btn, color: 'var(--accent-red)', borderColor: 'rgba(255,51,102,0.3)' }}>Clear</button>
        {savedAt && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--accent-green)' }}>✓ {savedAt}</span>}
      </div>

      {/* Question strip */}
      {question && (
        <div style={{ padding: '10px 16px', background: 'rgba(0,212,255,0.04)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, marginRight: 8, fontFamily: 'var(--font-mono)' }}>Q.</span>{question}
        </div>
      )}

      {/* Editor + Notes */}
      <div style={{ display: 'flex', minHeight: 360 }}>
        <div style={{ flex: 1, display: 'flex', overflow: 'auto', background: 'var(--bg-primary)' }}>
          <LineNumbers code={code} fontSize={fs} />
          <textarea
            ref={taRef} value={code} onChange={e => setCode(e.target.value)} onKeyDown={handleKeyDown} spellCheck={false}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', padding: '14px 16px 14px 10px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: fs, lineHeight: '1.6', caretColor: 'var(--accent-cyan)', minHeight: 360 }}
          />
        </div>
        {showNotes && (
          <div style={{ width: 240, borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>SCRATCH PAD</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={'Edge cases...\nTime complexity...\nApproach notes...'} style={{ flex: 1, background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: 'none', outline: 'none', resize: 'none', padding: '12px', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', lineHeight: 1.7, caretColor: 'var(--accent-cyan)' }} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '5px 16px', background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 20, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>
        <span>Tab → 4 spaces</span>
        <span>Auto-saves every 0.8s</span>
        <span>No execution — just like a real interview</span>
      </div>
    </div>
  )
}
