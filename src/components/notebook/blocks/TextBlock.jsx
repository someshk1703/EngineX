/* eslint-disable react/prop-types */
import { useEffect, useRef } from 'react'

// A contentEditable text block, stacked in normal document flow. The initial
// HTML is set imperatively once per block instance (mount only) so React
// never re-renders over the DOM while the user is typing — fighting
// contentEditable via re-renders would reset the caret position and drop
// keystrokes.
export default function TextBlock({ block, onChange, onDelete }) {
  const contentRef = useRef(null)

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = block.content?.html || '<p><br></p>'
    }
    // Intentionally only re-run when a different block mounts into this slot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.id])

  function handleInput() {
    onChange(block.id, { content: { html: contentRef.current.innerHTML } })
  }

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--card-gradient)',
        border: '1px solid var(--border-color)',
        borderRadius: 8,
        marginBottom: 12,
      }}
    >
      <button
        onClick={() => onDelete(block.id)}
        title="Delete note"
        style={{
          position: 'absolute', top: 6, right: 8, background: 'none', border: 'none',
          color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1,
        }}
      >×</button>
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        style={{
          padding: '14px 32px 14px 14px', outline: 'none', minHeight: 40,
          color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.6, cursor: 'text',
        }}
      />
    </div>
  )
}
