/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { getImageSignedUrl } from '../../../services/notebookService'

// A pasted/dropped image, stacked in normal document flow. The bucket is
// private, so we resolve a short-lived signed URL once per block.
export default function ImageBlock({ block, onDelete }) {
  const [url, setUrl] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    getImageSignedUrl(block.content?.storagePath)
      .then((signedUrl) => { if (!cancelled) setUrl(signedUrl) })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [block.content?.storagePath])

  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <button
        onClick={() => onDelete(block.id)}
        title="Delete image"
        style={{
          position: 'absolute', top: 6, right: 8, background: 'rgba(0,0,0,0.5)', border: 'none',
          color: '#fff', cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1, borderRadius: 4, padding: '2px 6px',
        }}
      >×</button>
      {error && (
        <div style={{ padding: 16, border: '1px dashed var(--border-color)', borderRadius: 8, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Couldn&apos;t load image
        </div>
      )}
      {!error && url && (
        <img
          src={url}
          alt={block.content?.alt || ''}
          style={{ maxWidth: '100%', borderRadius: 8, display: 'block' }}
        />
      )}
      {!error && !url && (
        <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading image…</div>
      )}
    </div>
  )
}
