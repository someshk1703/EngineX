import { useState, lazy, Suspense } from 'react'
import { ALL_CHAPTERS as CHAPTERS } from '../data/topics'
import { QUESTIONS_MAP } from '../data/questions'
import ChapterCard from './shared/ChapterCard'
import QuestionsPanel from './shared/QuestionsPanel'
import LazyFallback from './shared/LazyFallback'

const FlashcardManager = lazy(() => import('./FlashcardManager'))

// ─── Category View (Questions | Flashcards | Chapters) — the "topics" page for a section ──
export default function CategoryView({ category, progress, onOpenChapter, onBack }) {
  const questions     = QUESTIONS_MAP[category.id] || []
  const chaptersInCat = CHAPTERS.filter(c => c.category === category.id)
  const hasQuestions  = questions.length > 0
  const hasChapters   = chaptersInCat.length > 0
  const qType         = category.id === 'Java' ? 'java' : 'dsa'

  // Default tab priority: chapters → questions → flashcards
  const defaultTab = hasChapters ? 'chapters' : hasQuestions ? 'questions' : 'flashcards'
  const [activeTab, setActiveTab] = useState(defaultTab)

  const tabs = [
    hasChapters         && { key: 'chapters',   label: '◈ AI Chapters', count: chaptersInCat.length },
    hasQuestions        && { key: 'questions',  label: '💡 Questions', count: questions.length },
    true                && { key: 'flashcards', label: '📌 Flashcards' },
  ].filter(Boolean)

  const readCount = chaptersInCat.filter(c => progress[c.id]?.read).length

  return (
    <div>
      {/* Category Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <button className="btn-console" onClick={onBack} style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
          ← LIBRARY
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>{category.icon}</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{category.name}</h1>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {questions.length > 0 && `${questions.length} questions · `}
            {hasChapters && `${readCount}/${chaptersInCat.length} chapters read`}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-color)', marginBottom: 28 }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 18px',
              fontFamily: 'var(--font-mono)', fontSize: '0.82rem', letterSpacing: 0.5,
              color: activeTab === tab.key ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${activeTab === tab.key ? 'var(--accent-cyan)' : 'transparent'}`,
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: activeTab === tab.key ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'chapters' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {chaptersInCat.map(chapter => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              progress={progress}
              onClick={() => onOpenChapter(chapter)}
            />
          ))}
        </div>
      )}

      {activeTab === 'questions' && (
        <QuestionsPanel questions={questions} type={qType} />
      )}

      {activeTab === 'flashcards' && (
        <Suspense fallback={<LazyFallback />}>
          <FlashcardManager section={category.id.toLowerCase().replace(/\s+/g, '-')} />
        </Suspense>
      )}
    </div>
  )
}
