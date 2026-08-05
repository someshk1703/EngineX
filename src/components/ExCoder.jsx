import { useState, useEffect, useRef } from 'react'
import { DSA_QUESTIONS, JAVA_QUESTIONS } from '../data/questions'
import { evaluateCode, generateCoderChatMessage, hasApiKey } from '../services/claudeService'

const SIDEBAR_W = 288
const CODE_KEY  = 'enginex_excoder_code' // { [questionId]: { code, language } }

const ALL_QUESTIONS = [
  ...DSA_QUESTIONS.map(q => ({ ...q, _cat: 'DSA' })),
  ...JAVA_QUESTIONS.map(q => ({ ...q, _cat: 'Java' })),
]

const DIFF_COLOR = { Easy: '#00ff66', Medium: '#ffaa00', Hard: '#ff4444' }
const DIFF_BG    = { Easy: 'rgba(0,255,102,0.08)', Medium: 'rgba(255,170,0,0.08)', Hard: 'rgba(255,68,68,0.08)' }

const LANG_STARTER = {
  javascript: '// Write your solution here\nfunction solve() {\n\n}\n',
  python:     '# Write your solution here\ndef solve():\n    pass\n',
  java:       '// Write your solution here\nclass Solution {\n\n}\n',
}

function loadSavedCode() {
  try { return JSON.parse(localStorage.getItem(CODE_KEY)) || {} } catch { return {} }
}
function saveSavedCode(map) {
  try { localStorage.setItem(CODE_KEY, JSON.stringify(map)) } catch { /* ignore quota errors */ }
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

// ─── AI evaluation result panel ───────────────────────────────────────────────

const VERDICT_STYLE = {
  correct:           { color: 'var(--accent-green)',  label: '✓ CORRECT' },
  partially_correct: { color: 'var(--accent-yellow)', label: '◐ PARTIALLY CORRECT' },
  incorrect:         { color: 'var(--accent-red)',    label: '✕ INCORRECT' },
}

function EvaluationPanel({ result, evaluating, error }) {
  const mono = { fontFamily: 'var(--font-mono)' }

  if (evaluating) {
    return (
      <div style={{ ...mono, padding: '14px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        🤖 Evaluating your solution…
      </div>
    )
  }
  if (error) {
    return (
      <div style={{ ...mono, background: 'rgba(255,51,102,0.08)', border: '1px solid var(--accent-red)', borderRadius: 6, padding: '10px 14px', color: 'var(--accent-red)', fontSize: '0.8rem', marginTop: 10 }}>
        ⚠ {error}
      </div>
    )
  }
  if (!result) return null

  const v = VERDICT_STYLE[result.verdict] || VERDICT_STYLE.incorrect
  const Block = ({ label, children }) => (
    <div style={{ marginTop: 14 }}>
      <div style={{ ...mono, fontSize: '0.65rem', letterSpacing: 1, color: 'var(--accent-cyan)', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  )
  const List = ({ items, color }) => (
    <ul style={{ margin: 0, paddingLeft: 18, ...mono, fontSize: '0.78rem', color: color || 'var(--text-secondary)', lineHeight: 1.7 }}>
      {items.map((it, i) => <li key={i} style={{ marginBottom: 4 }}>{it}</li>)}
    </ul>
  )

  return (
    <div style={{ marginTop: 16, border: '1px solid var(--border-color)', borderRadius: 8, padding: '16px 18px', background: 'var(--bg-secondary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{
          ...mono, fontWeight: 700, fontSize: '0.75rem', color: v.color, padding: '3px 10px',
          borderRadius: 12, background: `${v.color}1a`, border: `1px solid ${v.color}44`,
        }}>{v.label}</span>
        {typeof result.score === 'number' && (
          <span style={{ ...mono, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>{result.score}/100</span>
        )}
      </div>

      {result.summary && (
        <p style={{ ...mono, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 10 }}>{result.summary}</p>
      )}

      {result.complexity && (
        <Block label="COMPLEXITY">
          <div style={{ ...mono, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Time: <span style={{ color: 'var(--text-primary)' }}>{result.complexity.time}</span>
            {' · '}Space: <span style={{ color: 'var(--text-primary)' }}>{result.complexity.space}</span>
          </div>
          {result.complexity.assessment && (
            <div style={{ ...mono, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{result.complexity.assessment}</div>
          )}
        </Block>
      )}

      {result.strengths?.length > 0 && <Block label="STRENGTHS"><List items={result.strengths} color="var(--accent-green)" /></Block>}
      {result.issues?.length > 0 && <Block label="ISSUES"><List items={result.issues} color="var(--accent-red)" /></Block>}
      {result.edgeCasesMissed?.length > 0 && <Block label="EDGE CASES MISSED"><List items={result.edgeCasesMissed} color="var(--accent-yellow)" /></Block>}
      {result.suggestions?.length > 0 && <Block label="SUGGESTIONS"><List items={result.suggestions} /></Block>}
    </div>
  )
}

// ─── AI coach chatbot (problem + code aware) ──────────────────────────────────

function ExCoderChat({ question, code, language }) {
  const starterMsg = `Hi! I'm your AI coach for **${question.title}**. Ask me for hints, help debugging your code, or a walkthrough of the approach.`
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: starterMsg }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  // Reset the conversation whenever the selected question changes
  useEffect(() => {
    setMessages([{ role: 'assistant', content: starterMsg }])
    setInput('')
  }, [question.id]) // eslint-disable-line

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setSending(true)
    try {
      const reply = await generateCoderChatMessage(question, code, language, messages, text)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠ Error: ${err.message}. Make sure your API key is configured in Settings.` }])
    } finally {
      setSending(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  const renderMsg = (text) => text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>')

  if (!hasApiKey()) return null

  return (<>
    <button className="chatbot-fab" onClick={() => setIsOpen(o => !o)} title="AI Coach">
      {isOpen ? '✕' : '💬'}
    </button>

    {isOpen && (
      <div
        onClick={() => setIsOpen(false)}
        style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 89, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
        className="chatbot-mobile-backdrop"
      />
    )}

    <div className={`chatbot-panel ${isOpen ? '' : 'hidden'}`}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: 2 }}>AI COACH</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginTop: 2 }}>{question.title}</div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1 }}
        >✕</button>
      </div>

      <div className="chatbot-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>
            <span dangerouslySetInnerHTML={{ __html: renderMsg(m.content) }} />
          </div>
        ))}
        {sending && (
          <div className="chat-bubble assistant" style={{ opacity: 0.6 }}>
            <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: 2 }}>▋ thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-bar">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about this problem or your code..."
          disabled={sending}
        />
        <button className="chat-send-btn" onClick={send} disabled={sending || !input.trim()}>↑</button>
      </div>
    </div>
  </>)
}

// ─── Question + code editor panel ─────────────────────────────────────────────

function QuestionDetail({ q }) {
  const [showHints, setShowHints]       = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [language, setLanguage]         = useState('javascript')
  const [code, setCode]                 = useState('')
  const [evaluating, setEvaluating]     = useState(false)
  const [result, setResult]             = useState(null)
  const [error, setError]               = useState(null)
  const codeTaRef      = useRef(null)
  const lineNumbersRef = useRef(null)

  const isDSA = q._cat === 'DSA'

  // Load this question's saved draft (or a fresh starter) whenever the selection changes
  useEffect(() => {
    const saved = loadSavedCode()[q.id]
    const lang = saved?.language || 'javascript'
    setLanguage(lang)
    setCode(saved?.code?.trim() ? saved.code : LANG_STARTER[lang])
    setResult(null)
    setError(null)
  }, [q.id])

  // Persist draft code per-question so switching questions doesn't lose work
  useEffect(() => {
    const map = loadSavedCode()
    map[q.id] = { code, language }
    saveSavedCode(map)
  }, [code, language, q.id])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setCode(prev => (!prev.trim() || Object.values(LANG_STARTER).includes(prev)) ? LANG_STARTER[lang] : prev)
  }

  const handleEvaluate = async () => {
    if (!hasApiKey()) { setError('Add an AI provider key in Settings to use EX-Coder evaluation.'); return }
    if (!code.trim())  { setError('Write some code first.'); return }
    setEvaluating(true); setError(null); setResult(null)
    try {
      setResult(await evaluateCode(q, code, language))
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setEvaluating(false)
    }
  }

  const INDENT = '  '

  // Keep the caret at a given position after a controlled-value change (fallback only)
  const setCaret = (pos) => {
    requestAnimationFrame(() => {
      const ta = codeTaRef.current
      if (ta) ta.setSelectionRange(pos, pos)
    })
  }

  // Insert text at the current selection using the browser's native editing command so the DOM
  // (value + caret) updates synchronously — avoids a race with the very next keystroke that a
  // React state update + rAF-based setSelectionRange can lose under fast typing.
  const insertAtCursor = (ta, text) => {
    const ok = document.execCommand && document.execCommand('insertText', false, text)
    if (!ok) {
      const { selectionStart: start, selectionEnd: end, value } = ta
      const next = value.slice(0, start) + text + value.slice(end)
      setCode(next)
      setCaret(start + text.length)
    }
  }

  const handleCodeKeyDown = (e) => {
    const ta = e.target
    const { selectionStart: start, selectionEnd: end, value } = ta

    if (e.key === 'Tab') {
      e.preventDefault() // don't let Tab move focus off the editor (e.g. to the chat FAB)
      if (start === end) {
        insertAtCursor(ta, INDENT)
        return
      }
      // Indent/outdent every line touched by the selection
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const selected = value.slice(lineStart, end)
      const newSelected = e.shiftKey
        ? selected.split('\n').map(l => l.replace(/^ {1,2}/, '')).join('\n')
        : selected.split('\n').map(l => INDENT + l).join('\n')
      ta.setSelectionRange(lineStart, end)
      insertAtCursor(ta, newSelected)
      return
    }

    if (e.key === 'Enter') {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const currentLine = value.slice(lineStart, start)
      const indentMatch = currentLine.match(/^\s*/)
      let indent = indentMatch ? indentMatch[0] : ''
      if (/[{[(:]\s*$/.test(currentLine)) indent += INDENT
      if (indent) {
        e.preventDefault()
        insertAtCursor(ta, '\n' + indent)
      }
    }
  }


  const handleCodeScroll = (e) => {
    if (lineNumbersRef.current) lineNumbersRef.current.style.transform = `translateY(-${e.target.scrollTop}px)`
  }

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

        {/* ── Your solution + AI evaluation ────────────────────────── */}
        <div style={{ marginTop: 20, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ ...mono, fontSize: '0.65rem', letterSpacing: 1, color: 'var(--accent-cyan)' }}>YOUR SOLUTION</span>
            <select
              value={language}
              onChange={e => handleLanguageChange(e.target.value)}
              style={{
                background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 4,
                color: 'var(--text-primary)', ...mono, fontSize: '0.75rem', padding: '3px 8px', cursor: 'pointer',
              }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
            <button className="btn-console" onClick={() => setCode(LANG_STARTER[language])} style={{ padding: '5px 12px', fontSize: '0.72rem' }}>
              ↺ RESET
            </button>
            <button
              className="btn-console btn-console-success"
              onClick={handleEvaluate}
              disabled={evaluating}
              style={{ padding: '5px 14px', fontSize: '0.75rem', marginLeft: 'auto' }}
            >
              {evaluating ? '🤖 Evaluating…' : '🤖 Evaluate with AI'}
            </button>
          </div>

          <div style={{ position: 'relative', border: '1px solid var(--border-color)', borderRadius: 6, overflow: 'hidden' }}>
            <div
              ref={lineNumbersRef}
              aria-hidden="true"
              style={{
                position: 'absolute', top: 0, left: 0, bottom: 0, width: 44,
                padding: '14px 8px 14px 0', textAlign: 'right', userSelect: 'none', pointerEvents: 'none',
                background: 'var(--bg-primary)', borderRight: '1px solid var(--border-color)',
                color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                lineHeight: 1.6, overflow: 'hidden', boxSizing: 'border-box',
              }}
            >
              {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea
              ref={codeTaRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleCodeKeyDown}
              onScroll={handleCodeScroll}
              spellCheck={false}
              style={{
                display: 'block', width: '100%', minHeight: 460, resize: 'vertical', boxSizing: 'border-box',
                background: 'var(--bg-primary)', border: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
                padding: '14px 16px 14px 56px', fontSize: '0.85rem', lineHeight: 1.6, outline: 'none', tabSize: 2,
              }}
            />
          </div>

          {!hasApiKey() && (
            <div style={{ ...mono, fontSize: '0.72rem', color: 'var(--accent-yellow)', marginTop: 8 }}>
              ⚠ No AI provider configured — add a key in Settings to evaluate code.
            </div>
          )}

          <EvaluationPanel result={result} evaluating={evaluating} error={error} />
        </div>
      </div>

      <ExCoderChat question={q} code={code} language={language} />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ExCoder({ onBack }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [qFilter, setQFilter] = useState('DSA')
  const [selectedQ, setSelectedQ] = useState(() => ALL_QUESTIONS.find(q => q._cat === 'DSA') || null)

  const questions = ALL_QUESTIONS.filter(q => q._cat === qFilter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', overflow: 'hidden', position: 'relative' }}>

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
          onClick={() => setDrawerOpen(o => !o)}
          style={{ padding: '5px 10px', fontSize: '0.72rem' }}
          title="Browse questions"
        >
          ☰ QUESTIONS
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-green)', letterSpacing: 1 }}>
            ⌨ EX-CODER
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: 1,
            padding: '2px 8px', borderRadius: 20,
            background: 'rgba(0,255,102,0.08)', border: '1px solid rgba(0,255,102,0.3)',
            color: 'var(--accent-green)',
          }}>AI CODE REVIEWER</span>
        </div>

        {selectedQ && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 8 }}>
            {selectedQ.title}
          </span>
        )}
      </div>

      {/* ── Questions drawer (hamburger sidebar) ─────────────────── */}
      {drawerOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}
          onClick={() => setDrawerOpen(false)}
        >
          {/* backdrop */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }} />
          {/* drawer panel */}
          <div
            className="topic-drawer"
            style={{
              position: 'relative', zIndex: 1,
              width: SIDEBAR_W, height: '100%',
              background: 'var(--bg-secondary)',
              borderRight: '1px solid var(--border-color)',
              display: 'flex', flexDirection: 'column',
              boxShadow: '4px 0 32px rgba(0,0,0,0.4)',
              borderRadius: '0 20px 20px 0',
              overflow: 'hidden',
              animation: 'slideInLeft 0.22s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* drawer header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid var(--border-color)', flexShrink: 0,
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-green)', letterSpacing: 1 }}>
                QUESTIONS
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1, padding: 4 }}
              >✕</button>
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
              {['DSA', 'Java'].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setQFilter(cat)
                    setSelectedQ(ALL_QUESTIONS.find(q => q._cat === cat) || null)
                  }}
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
            <QuestionList
              questions={questions}
              onSelect={(q) => { setSelectedQ(q); setDrawerOpen(false) }}
              selected={selectedQ}
            />
          </div>
        </div>
      )}

      {/* ── Body: question + code editor (always full width) ──────── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {selectedQ ? (
          <QuestionDetail q={selectedQ} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: 32 }}>
            <div style={{ fontSize: '2rem' }}>⌨</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              Pick a problem to start coding
            </div>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 420, lineHeight: 1.7, fontSize: '0.88rem' }}>
              Tap <strong>☰ QUESTIONS</strong> to browse problems, write your solution, and have EngineX's AI agent evaluate it for correctness, complexity, and style.
            </p>
            <button className="btn-console btn-console-success" onClick={() => setDrawerOpen(true)} style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
              ☰ Browse Questions
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
