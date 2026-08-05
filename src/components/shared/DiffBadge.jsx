// ─── Difficulty badge ─────────────────────────────────────────────────────────
export default function DiffBadge({ difficulty }) {
  const colors = { Easy: 'var(--accent-green)', Medium: 'var(--accent-yellow)', Hard: 'var(--accent-red)' }
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: 1,
      padding: '2px 8px', borderRadius: 4,
      color: colors[difficulty] || 'var(--text-muted)',
      border: `1px solid ${colors[difficulty] || 'var(--border-color)'}33`,
      background: `${colors[difficulty] || 'var(--border-color)'}10`,
    }}>
      {difficulty}
    </span>
  )
}
