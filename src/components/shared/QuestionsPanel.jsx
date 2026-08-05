import { useState, lazy, Suspense } from 'react'
import DiffBadge from './DiffBadge'
import LazyFallback from './LazyFallback'

const InterviewWhiteboard = lazy(() => import('../InterviewWhiteboard'))

// ─── Questions Panel (DSA coding problems + Java conceptual Q&A) ──────────────
export default function QuestionsPanel({ questions = [], type = 'dsa' }) {
  const [filter, setFilter]   = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [showHint, setShowHint]  = useState(false)
  const [showSol, setShowSol]    = useState(false)
  const [showWb, setShowWb]      = useState(false)

  const filtered = filter === 'ALL' ? questions : questions.filter(q => q.difficulty === filter)

  const openQ = (q) => { setSelected(q); setShowHint(false); setShowSol(false); setShowWb(false) }

  if (selected) {
    return (
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <button className="btn-console" onClick={() => setSelected(null)} style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
            ← QUESTIONS
          </button>
          <DiffBadge difficulty={selected.difficulty} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)', border: '1px solid rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: 4 }}>
            {selected.topic}
          </span>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
            {selected.title}
          </h2>
        </div>

        {/* DSA problem layout */}
        {type === 'dsa' && (
          <>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 16 }}>{selected.description}</p>
              {selected.examples.map((ex, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Example {i + 1}</div>
                  <div style={{ background: 'var(--bg-primary)', borderRadius: 4, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                    <div><span style={{ color: 'var(--accent-cyan)' }}>Input: </span><span style={{ color: 'var(--text-secondary)' }}>{ex.input}</span></div>
                    <div><span style={{ color: 'var(--accent-green)' }}>Output: </span><span style={{ color: 'var(--text-secondary)' }}>{ex.output}</span></div>
                    {ex.explanation && <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>{ex.explanation}</div>}
                  </div>
                </div>
              ))}
              {selected.constraints?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, letterSpacing: 1 }}>CONSTRAINTS</div>
                  <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.8 }}>
                    {selected.constraints.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Hints */}
            <div style={{ marginBottom: 12 }}>
              <button
                className="btn-console"
                onClick={() => setShowHint(h => !h)}
                style={{ padding: '6px 14px', fontSize: '0.78rem', borderColor: 'var(--accent-yellow)', color: 'var(--accent-yellow)' }}
              >
                {showHint ? '▼ HIDE HINTS' : '▶ SHOW HINTS'}
              </button>
              {showHint && (
                <div style={{ marginTop: 10, background: 'rgba(255,204,0,0.05)', border: '1px solid rgba(255,204,0,0.2)', borderRadius: 6, padding: '14px 18px' }}>
                  {selected.hints.map((h, i) => (
                    <div key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: i < selected.hints.length - 1 ? 8 : 0 }}>
                      <span style={{ color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)' }}>#{i + 1}</span> {h}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Solution */}
            <div>
              <button
                className="btn-console btn-console-success"
                onClick={() => setShowSol(s => !s)}
                style={{ padding: '6px 14px', fontSize: '0.78rem' }}
              >
                {showSol ? '▼ HIDE SOLUTION' : '▶ REVEAL SOLUTION'}
              </button>
              {showSol && (
                <div style={{ marginTop: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '20px 24px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 8 }}>APPROACH</div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>{selected.solution.approach}</p>
                  <div style={{ background: 'var(--bg-primary)', borderRadius: 6, padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-primary)', whiteSpace: 'pre', overflowX: 'auto', marginBottom: 14, lineHeight: 1.6, border: '1px solid var(--border-color)' }}>
                    {selected.solution.code}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    <span><span style={{ color: 'var(--text-muted)' }}>Time: </span><span style={{ color: 'var(--accent-cyan)' }}>{selected.solution.complexity.time}</span></span>
                    <span><span style={{ color: 'var(--text-muted)' }}>Space: </span><span style={{ color: 'var(--accent-cyan)' }}>{selected.solution.complexity.space}</span></span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Java Q&A layout */}
        {type === 'java' && (
          <>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', letterSpacing: 1, marginBottom: 10 }}>QUESTION</div>
              <p style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500, lineHeight: 1.6 }}>{selected.question}</p>
            </div>

            <button
              className="btn-console btn-console-success"
              onClick={() => setShowSol(s => !s)}
              style={{ padding: '6px 14px', fontSize: '0.78rem', marginBottom: 12 }}
            >
              {showSol ? '▼ HIDE ANSWER' : '▶ REVEAL ANSWER'}
            </button>

            {showSol && (
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '20px 24px' }}>
                {selected.answer.split('\n\n').map((para, i) => (
                  <p key={i} style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 12, whiteSpace: 'pre-wrap' }}>
                    {para}
                  </p>
                ))}
                {selected.keyPoints?.length > 0 && (
                  <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(0,255,102,0.05)', border: '1px solid rgba(0,255,102,0.2)', borderRadius: 6 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-green)', letterSpacing: 1, marginBottom: 8 }}>KEY POINTS</div>
                    <ul style={{ paddingLeft: 18, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.8 }}>
                      {selected.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
                {selected.codeExample && (
                  <div style={{ marginTop: 14, background: 'var(--bg-primary)', borderRadius: 6, padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-primary)', whiteSpace: 'pre', overflowX: 'auto', border: '1px solid var(--border-color)', lineHeight: 1.6 }}>
                    {selected.codeExample}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Interview Whiteboard ── */}
        <div style={{ marginTop: 28 }}>
          <button
            className="btn-console"
            onClick={() => setShowWb(w => !w)}
            style={{ padding: '6px 14px', fontSize: '0.78rem', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
          >
            {showWb ? '▼ CLOSE WHITEBOARD' : '▶ OPEN WHITEBOARD'}
          </button>
          {showWb && (
            <div style={{ marginTop: 14 }}>
              <Suspense fallback={<LazyFallback />}>
                <InterviewWhiteboard
                  questionId={selected.id}
                  question={type === 'dsa' ? selected.description : selected.question}
                  questionType={type}
                />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Difficulty filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['ALL', 'Easy', 'Medium', 'Hard'].map(d => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            style={{
              background: filter === d ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
              color: filter === d ? 'var(--bg-primary)' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 4, padding: '5px 14px', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '0.78rem', letterSpacing: 0.5,
              transition: 'all 0.15s',
            }}
          >
            {d}
            <span style={{ marginLeft: 6, color: filter === d ? 'var(--bg-primary)' : 'var(--text-muted)', fontSize: '0.7rem' }}>
              {d === 'ALL' ? questions.length : questions.filter(q => q.difficulty === d).length}
            </span>
          </button>
        ))}
      </div>

      {/* Question list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => openQ(q)}
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              borderRadius: 8, padding: '14px 18px', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', width: 24, flexShrink: 0 }}>
              {String(idx + 1).padStart(2, '0')}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, fontSize: '0.95rem' }}>{q.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{q.topic}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {q.tags.slice(0, 2).map(t => <span key={t} className="tech-tag">{t}</span>)}
              <DiffBadge difficulty={q.difficulty} />
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: 4 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
