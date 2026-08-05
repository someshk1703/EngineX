// Shared fallback shown while a lazy-loaded chunk is being fetched
export default function LazyFallback() {
  return (
    <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)', letterSpacing: 1 }}>
      Loading…
    </div>
  )
}
