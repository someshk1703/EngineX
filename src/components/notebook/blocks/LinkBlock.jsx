/* eslint-disable react/prop-types */
// A pasted link, stacked in normal document flow. YouTube links render as an
// inline mini player; other links render as a "quick view" bookmark card.
export default function LinkBlock({ block, onDelete }) {
  const { kind, url, videoId, title, favicon } = block.content || {}

  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <button
        onClick={() => onDelete(block.id)}
        title="Delete link"
        style={{
          position: 'absolute', top: 6, right: 8, zIndex: 1, background: 'rgba(0,0,0,0.5)', border: 'none',
          color: '#fff', cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1, borderRadius: 4, padding: '2px 6px',
        }}
      >×</button>

      {kind === 'youtube' ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={url}
          width="320"
          height="180"
          style={{ border: 'none', borderRadius: 8, display: 'block', maxWidth: '100%' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 32px 10px 12px',
            background: 'var(--card-gradient)', border: '1px solid var(--border-color)', borderRadius: 8,
            textDecoration: 'none', color: 'var(--text-primary)',
          }}
        >
          {favicon && <img src={favicon} alt="" width={20} height={20} style={{ borderRadius: 4, flexShrink: 0 }} />}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {title || url}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {url}
            </div>
          </div>
        </a>
      )}
    </div>
  )
}
