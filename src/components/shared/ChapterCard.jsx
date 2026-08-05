// ─── Chapter Card ─────────────────────────────────────────────────────────────
export default function ChapterCard({ chapter, progress, onClick }) {
  const chProg = progress[chapter.id]
  const isRead = !!chProg?.read
  const quizScore = chProg?.quizScore
  const hasQuiz = quizScore !== undefined

  return (
    <div className={`chapter-card ${isRead ? 'completed' : ''}`} onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: 1,
          color: 'var(--accent-cyan)', border: '1px solid rgba(0,0,0,0.3)',
          padding: '2px 8px', borderRadius: 4, background: 'rgba(0,0,0,0.05)',
        }}>
          {chapter.category}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
          color: chapter.complexity === 'Hard' ? 'var(--accent-red)' : chapter.complexity === 'Medium' ? 'var(--accent-yellow)' : 'var(--accent-green)',
        }}>
          {chapter.complexity}
        </span>
      </div>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)', lineHeight: 1.4 }}>
        {chapter.title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: 16 }}>
        {chapter.description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {chapter.tags.slice(0, 3).map(tag => (
          <span key={tag} className="tech-tag">{tag}</span>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        {isRead
          ? <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>✓ READ</span>
          : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>○ UNREAD</span>
        }
        {hasQuiz
          ? <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: quizScore >= 70 ? 'var(--accent-green)' : 'var(--accent-yellow)' }}>
              QUIZ: {quizScore}%
            </span>
          : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>QUIZ: —</span>
        }
      </div>
    </div>
  )
}
