/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import {
  addChapterSnapshotBlock,
  addImageBlock,
  addLinkBlock,
  createBlock,
  deleteBlock,
  findTopicNotebook,
  getNotebookWithBlocks,
  getOrCreateTopicNotebook,
  scheduleBlockSave,
} from '../../services/notebookService'
import TextBlock from './blocks/TextBlock'
import ImageBlock from './blocks/ImageBlock'
import LinkBlock from './blocks/LinkBlock'

const URL_RE = /^https?:\/\/\S+$/i

// Per-topic notes: a vertical scrollable stack of text/image/link blocks,
// auto-saved, bound 1:1 to a chapter/topic via topicKey. No document picker —
// every topic has exactly one notes document, created lazily on first write.
export default function ChapterNotes({ topicKey, topicTitle, chapterHtml }) {
  const [notebookId, setNotebookId] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkInputValue, setLinkInputValue] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    findTopicNotebook(topicKey)
      .then(async (nb) => {
        if (cancelled) return
        if (!nb) { setNotebookId(null); setBlocks([]); return }
        const { blocks: loaded } = await getNotebookWithBlocks(nb.id)
        if (cancelled) return
        setNotebookId(nb.id)
        setBlocks(loaded)
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load notes') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [topicKey])

  async function ensureNotebook() {
    if (notebookId) return notebookId
    const nb = await getOrCreateTopicNotebook(topicKey, topicTitle)
    setNotebookId(nb.id)
    return nb.id
  }

  async function withBusyGuard(fn) {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  function handleAddNote() {
    withBusyGuard(async () => {
      const id = await ensureNotebook()
      const block = await createBlock(id, 'text', {}, { html: '' })
      setBlocks((prev) => [...prev, block])
    })
  }

  function handleSaveChapterSnapshot() {
    withBusyGuard(async () => {
      const id = await ensureNotebook()
      const block = await addChapterSnapshotBlock(id, chapterHtml)
      setBlocks((prev) => [...prev, block])
    })
  }

  function handleConfirmAddLink() {
    const url = linkInputValue.trim()
    if (!url || !URL_RE.test(url)) return
    withBusyGuard(async () => {
      const id = await ensureNotebook()
      const block = await addLinkBlock(id, url)
      setBlocks((prev) => [...prev, block])
    })
    setLinkInputValue('')
    setShowLinkInput(false)
  }

  function handlePaste(e) {
    const items = Array.from(e.clipboardData?.items || [])
    const imageItem = items.find((it) => it.kind === 'file' && it.type.startsWith('image/'))
    if (imageItem) {
      e.preventDefault()
      const file = imageItem.getAsFile()
      withBusyGuard(async () => {
        const id = await ensureNotebook()
        const block = await addImageBlock(id, file)
        setBlocks((prev) => [...prev, block])
      })
      return
    }

    const isEditingNote = document.activeElement?.getAttribute('contenteditable') === 'true'
    if (isEditingNote) return

    const text = e.clipboardData?.getData('text/plain')?.trim()
    if (text && URL_RE.test(text)) {
      e.preventDefault()
      withBusyGuard(async () => {
        const id = await ensureNotebook()
        const block = await addLinkBlock(id, text)
        setBlocks((prev) => [...prev, block])
      })
    }
  }

  function handleBlockChange(blockId, patch) {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, ...patch } : b)))
    scheduleBlockSave(blockId, patch, setSaveStatus)
  }

  function handleDeleteBlock(blockId) {
    withBusyGuard(async () => {
      await deleteBlock(blockId)
      setBlocks((prev) => prev.filter((b) => b.id !== blockId))
    })
  }

  return (
    <div onPaste={handlePaste}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <button className="btn-console" onClick={handleAddNote} disabled={busy} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
          + Note
        </button>
        <button className="btn-console" onClick={() => setShowLinkInput((v) => !v)} disabled={busy} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
          + Link
        </button>
        {chapterHtml && (
          <button className="btn-console" onClick={handleSaveChapterSnapshot} disabled={busy} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
            📥 Save this chapter here
          </button>
        )}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Paste images or links directly into this panel
        </span>
        {saveStatus === 'saving' && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Saving…</span>}
        {saveStatus === 'saved' && <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)' }}>✓ Saved</span>}
        {saveStatus === 'error' && <span style={{ fontSize: '0.7rem', color: 'var(--accent-red)' }}>⚠ Save failed</span>}
      </div>

      {showLinkInput && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            type="url"
            autoFocus
            value={linkInputValue}
            onChange={(e) => setLinkInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmAddLink(); if (e.key === 'Escape') setShowLinkInput(false) }}
            placeholder="https://example.com or a YouTube link"
            style={{ flex: 1, padding: '6px 10px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: '0.85rem' }}
          />
          <button className="btn-console" onClick={handleConfirmAddLink} disabled={busy} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
            Add
          </button>
        </div>
      )}

      {error && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-red)', marginBottom: 12 }}>
          ⚠ {error}
        </div>
      )}

      {loading && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading notes…</div>}

      {!loading && blocks.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
          No notes yet — write something, paste a diagram, or paste a link to get started.
        </div>
      )}

      {!loading && blocks.map((block) => {
        if (block.type === 'text') {
          return <TextBlock key={block.id} block={block} onChange={handleBlockChange} onDelete={handleDeleteBlock} />
        }
        if (block.type === 'image') {
          return <ImageBlock key={block.id} block={block} onDelete={handleDeleteBlock} />
        }
        if (block.type === 'link') {
          return <LinkBlock key={block.id} block={block} onDelete={handleDeleteBlock} />
        }
        return null
      })}
    </div>
  )
}
