import { useState, useRef, useEffect, useCallback } from 'react'

// ─── Color themes (dark-mode adapted) ────────────────────────────────────────
const COLORS = {
  cyan:   { bg: 'rgba(0,212,255,0.08)',   border: '#00d4ff', dot: '#00d4ff' },
  green:  { bg: 'rgba(0,255,102,0.08)',   border: '#00ff66', dot: '#00ff66' },
  yellow: { bg: 'rgba(255,204,0,0.08)',   border: '#ffcc00', dot: '#ffcc00' },
  red:    { bg: 'rgba(255,51,102,0.08)',  border: '#ff3366', dot: '#ff3366' },
  purple: { bg: 'rgba(167,139,250,0.10)', border: '#a78bfa', dot: '#a78bfa' },
}
const COLOR_KEYS = Object.keys(COLORS)

function makeId() { return Math.random().toString(36).slice(2, 9) }

// ─── localStorage helpers ─────────────────────────────────────────────────────
const storageKey = (section) => `enginex_flashcards_${section}`

function loadCards(section) {
  try { return JSON.parse(localStorage.getItem(storageKey(section)) || '[]') } catch { return [] }
}
function saveCards(section, cards) {
  try { localStorage.setItem(storageKey(section), JSON.stringify(cards)) } catch {}
}

// ─── Single Card ──────────────────────────────────────────────────────────────
function FlashCard({ card, onUpdate, onDelete, containerRef }) {
  const cardRef  = useRef(null)
  const dragState = useRef(null)
  const color    = COLORS[card.color] || COLORS.cyan

  const startDrag = useCallback((clientX, clientY) => {
    dragState.current = {
      startX: clientX - card.position.x,
      startY: clientY - card.position.y,
    }
  }, [card.position])

  const onMouseMove = useCallback((e) => {
    if (!dragState.current) return
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - dragState.current.startX, rect.width - 284))
    const y = Math.max(0, Math.min(e.clientY - dragState.current.startY, rect.height - 160))
    onUpdate(card.id, { position: { x, y } })
  }, [card.id, onUpdate, containerRef])

  const onMouseUp = useCallback(() => {
    dragState.current = null
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }, [onMouseMove])

  const onMouseDown = (e) => {
    if (e.target.closest('textarea,input,button,select')) return
    e.preventDefault()
    startDrag(e.clientX, e.clientY)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const onTouchStart = (e) => {
    if (e.target.closest('textarea,input,button,select')) return
    const t = e.touches[0]
    startDrag(t.clientX, t.clientY)
  }
  const onTouchMove = (e) => {
    if (!dragState.current) return
    e.preventDefault()
    const t = e.touches[0]
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const x = Math.max(0, Math.min(t.clientX - dragState.current.startX, rect.width - 284))
    const y = Math.max(0, Math.min(t.clientY - dragState.current.startY, rect.height - 160))
    onUpdate(card.id, { position: { x, y } })
  }

  useEffect(() => () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }, [onMouseMove, onMouseUp])

  return (
    <div
      ref={cardRef}
      style={{
        position: 'absolute',
        left: card.position.x,
        top: card.position.y,
        width: 276,
        background: color.bg,
        border: `1px solid ${color.border}`,
        borderRadius: 8,
        boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 12px ${color.border}22`,
        userSelect: 'none',
        zIndex: 10,
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      {/* Header / drag handle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '7px 10px',
        cursor: 'grab',
        borderBottom: card.minimized ? 'none' : `1px solid ${color.border}33`,
        background: `${color.border}10`,
        borderRadius: card.minimized ? 8 : '8px 8px 0 0',
      }}>
        {/* Color dots */}
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {COLOR_KEYS.map(k => (
            <button
              key={k}
              onClick={() => onUpdate(card.id, { color: k })}
              title={k}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: COLORS[k].dot,
                border: card.color === k ? '2px solid #fff' : '2px solid transparent',
                cursor: 'pointer', padding: 0, flexShrink: 0,
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          <button
            onClick={() => onUpdate(card.id, { minimized: !card.minimized })}
            style={iconBtnStyle}
            title={card.minimized ? 'Expand' : 'Minimize'}
          >
            {card.minimized ? '▲' : '▼'}
          </button>
          <button
            onClick={() => onDelete(card.id)}
            style={{ ...iconBtnStyle, color: '#ff3366' }}
            title="Delete"
          >✕</button>
        </div>
      </div>

      {/* Body */}
      {!card.minimized && (
        <div style={{ padding: '10px 12px 12px' }}>
          {/* Front/Back toggle */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {['front', 'back'].map(side => (
              <button
                key={side}
                onClick={() => onUpdate(card.id, { flipped: side === 'back' })}
                style={{
                  padding: '2px 12px', borderRadius: 20, fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)', letterSpacing: 0.5, cursor: 'pointer',
                  border: `1px solid ${color.border}`,
                  background: (side === 'back') === card.flipped ? color.border : 'transparent',
                  color:      (side === 'back') === card.flipped ? '#000' : color.border,
                  fontWeight: 600, transition: 'all 0.15s',
                }}
              >
                {side.toUpperCase()}
              </button>
            ))}
          </div>
          <textarea
            value={card.flipped ? card.back : card.front}
            onChange={(e) => onUpdate(card.id, card.flipped ? { back: e.target.value } : { front: e.target.value })}
            placeholder={card.flipped ? 'Answer / explanation…' : 'Term / question…'}
            rows={4}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--bg-primary)',
              border: `1px solid ${color.border}44`,
              borderRadius: 4, padding: '6px 8px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)', fontSize: '0.85rem', lineHeight: 1.5,
              resize: 'vertical', outline: 'none',
            }}
          />
        </div>
      )}
    </div>
  )
}

const iconBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '0.7rem', color: 'var(--text-muted)',
  padding: '2px 4px', borderRadius: 3, lineHeight: 1,
}

// ─── FlashcardManager ─────────────────────────────────────────────────────────
export default function FlashcardManager({ section = 'default' }) {
  const containerRef = useRef(null)
  const [cards, setCards]       = useState(() => loadCards(section))
  const [collapsed, setCollapsed] = useState(false)

  // Persist whenever cards change
  useEffect(() => { saveCards(section, cards) }, [cards, section])

  const addCard = () => {
    const container = containerRef.current
    const offset = (cards.length % 8) * 24
    const x = Math.min(16 + offset, (container?.clientWidth ?? 600) - 300)
    const y = Math.min(16 + offset, 200)
    setCards(prev => [...prev, {
      id: makeId(),
      front: '',
      back: '',
      position: { x, y },
      flipped: false,
      minimized: false,
      color: COLOR_KEYS[cards.length % COLOR_KEYS.length],
    }])
  }

  const updateCard = useCallback((id, patch) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
  }, [])

  const deleteCard = useCallback((id) => {
    setCards(prev => prev.filter(c => c.id !== id))
  }, [])

  const minimizeAll = () => setCards(prev => prev.map(c => ({ ...c, minimized: true })))
  const expandAll   = () => setCards(prev => prev.map(c => ({ ...c, minimized: false })))

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderBottom: collapsed ? '1px solid var(--border-color)' : 'none',
        borderRadius: collapsed ? 6 : '6px 6px 0 0',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)', letterSpacing: 1, flex: 1 }}>
          📌 FLASHCARDS
          <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
            {cards.length} card{cards.length !== 1 ? 's' : ''}
          </span>
        </span>
        <button onClick={addCard}        style={toolbarBtnStyle('var(--accent-cyan)')}>+ New Card</button>
        <button onClick={minimizeAll}    style={toolbarBtnStyle('var(--text-muted)')} title="Minimize all">⊟</button>
        <button onClick={expandAll}      style={toolbarBtnStyle('var(--text-muted)')} title="Expand all">⊞</button>
        <button onClick={() => setCollapsed(c => !c)} style={toolbarBtnStyle('var(--text-muted)')}>
          {collapsed ? '▼ Show' : '▲ Hide'}
        </button>
      </div>

      {/* Canvas */}
      {!collapsed && (
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            minHeight: cards.length === 0 ? 100 : 400,
            border: '1px solid var(--border-color)',
            borderRadius: '0 0 6px 6px',
            background: 'var(--bg-primary)',
            backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            overflow: 'hidden',
          }}
        >
          {cards.length === 0 && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', gap: 8,
            }}>
              <div style={{ fontSize: '1.8rem' }}>🗒️</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: 1 }}>
                Click <span style={{ color: 'var(--accent-cyan)' }}>+ New Card</span> to start taking notes
              </div>
            </div>
          )}
          {cards.map(card => (
            <FlashCard
              key={card.id}
              card={card}
              onUpdate={updateCard}
              onDelete={deleteCard}
              containerRef={containerRef}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function toolbarBtnStyle(color) {
  return {
    background: 'transparent',
    color,
    border: `1px solid ${color}`,
    borderRadius: 4,
    padding: '3px 10px',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    letterSpacing: 0.5,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }
}
