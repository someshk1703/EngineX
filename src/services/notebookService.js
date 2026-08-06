import DOMPurify from 'dompurify'
import { supabase } from './supabaseClient'

const YOUTUBE_HOST_RE = /(?:^|\.)(youtube\.com|youtube-nocookie\.com|youtu\.be)$/i

function mapNotebookRow(row) {
  return { id: row.id, title: row.title, created_at: row.created_at, updated_at: row.updated_at }
}

function mapBlockRow(row) {
  return {
    id: row.id,
    notebookId: row.notebook_id,
    type: row.type,
    x: row.x,
    y: row.y,
    width: row.width,
    height: row.height,
    z_index: row.z_index,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

// List all of the current user's notebooks, most-recently-updated first.
export async function listNotebooks() {
  const { data, error } = await supabase
    .from('notebooks')
    .select('id, title, created_at, updated_at')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data.map(mapNotebookRow)
}

// Create a new, empty notebook with the given title.
export async function createNotebook(title) {
  const trimmed = (title || '').trim()
  if (!trimmed) throw new Error('Notebook title must not be empty')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('notebooks')
    .insert({ title: trimmed, user_id: user.id })
    .select('id, title, created_at, updated_at')
    .single()
  if (error) throw error
  return mapNotebookRow(data)
}

// Look up the current user's notebook bound to a topic key, if any exists yet.
export async function findTopicNotebook(topicKey) {
  const { data, error } = await supabase
    .from('notebooks')
    .select('id, title, created_at, updated_at')
    .eq('topic_key', topicKey)
    .maybeSingle()
  if (error) throw error
  return data ? mapNotebookRow(data) : null
}

// Find-or-create the one notebook bound to a topic key (e.g. a chapter id),
// so each topic gets exactly one notes document, created lazily on first use.
export async function getOrCreateTopicNotebook(topicKey, title) {
  const existing = await findTopicNotebook(topicKey)
  if (existing) return existing

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('notebooks')
    .insert({ title, user_id: user.id, topic_key: topicKey })
    .select('id, title, created_at, updated_at')
    .single()
  if (error) throw error
  return mapNotebookRow(data)
}

// Rename an existing notebook (RLS enforces ownership server-side).
export async function renameNotebook(notebookId, title) {
  const trimmed = (title || '').trim()
  if (!trimmed) throw new Error('Notebook title must not be empty')

  const { error } = await supabase
    .from('notebooks')
    .update({ title: trimmed })
    .eq('id', notebookId)
  if (error) throw error
}

// Delete a notebook and (via DB cascade) all of its blocks.
export async function deleteNotebook(notebookId) {
  const { error } = await supabase
    .from('notebooks')
    .delete()
    .eq('id', notebookId)
  if (error) throw error
}

// Fetch one notebook plus all of its blocks, ordered by z_index ascending.
export async function getNotebookWithBlocks(notebookId) {
  const [notebookRes, blocksRes] = await Promise.all([
    supabase.from('notebooks').select('id, title, created_at, updated_at').eq('id', notebookId).single(),
    supabase.from('notebook_blocks').select('*').eq('notebook_id', notebookId).order('z_index', { ascending: true }),
  ])
  if (notebookRes.error) throw notebookRes.error
  if (blocksRes.error) throw blocksRes.error

  return {
    notebook: mapNotebookRow(notebookRes.data),
    blocks: blocksRes.data.map(mapBlockRow),
  }
}

async function nextZIndex(notebookId) {
  const { data, error } = await supabase
    .from('notebook_blocks')
    .select('z_index')
    .eq('notebook_id', notebookId)
    .order('z_index', { ascending: false })
    .limit(1)
  if (error) throw error
  return (data[0]?.z_index ?? 0) + 1
}

// Create a new block of the given type. Blocks render as a vertical stack
// ordered by z_index (== creation order), so position is optional/unused.
export async function createBlock(notebookId, type, position = {}, content) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const z_index = await nextZIndex(notebookId)

  const { data, error } = await supabase
    .from('notebook_blocks')
    .insert({
      notebook_id: notebookId,
      user_id: user.id,
      type,
      x: position.x ?? 0,
      y: position.y ?? 0,
      width: position.width ?? 280,
      height: position.height ?? 160,
      z_index,
      content,
    })
    .select('*')
    .single()
  if (error) throw error
  return mapBlockRow(data)
}

// Patch a block's position/size/content, optionally bringing it to front.
export async function updateBlock(blockId, patch, bringToFront = false) {
  const update = { ...patch }

  if (bringToFront) {
    const { data: blockRow, error: fetchError } = await supabase
      .from('notebook_blocks')
      .select('notebook_id')
      .eq('id', blockId)
      .single()
    if (fetchError) throw fetchError
    update.z_index = await nextZIndex(blockRow.notebook_id)
  }

  const { data, error } = await supabase
    .from('notebook_blocks')
    .update(update)
    .eq('id', blockId)
    .select('*')
    .single()
  if (error) throw error
  return mapBlockRow(data)
}

// Delete a single block.
export async function deleteBlock(blockId) {
  const { error } = await supabase
    .from('notebook_blocks')
    .delete()
    .eq('id', blockId)
  if (error) throw error
}

// Sanitizes chapterHtml and appends it as a new text block to the topic's
// own notes (no document picker — there is exactly one target per topic).
export async function addChapterSnapshotBlock(notebookId, chapterHtml) {
  const safeHtml = DOMPurify.sanitize(chapterHtml)
  return createBlock(notebookId, 'text', {}, { html: safeHtml })
}

function extFromFile(file) {
  const name = file.name || ''
  const dot = name.lastIndexOf('.')
  if (dot >= 0 && dot < name.length - 1) return name.slice(dot + 1).toLowerCase()
  return (file.type.split('/')[1] || 'png').toLowerCase()
}

// Validates the file is an image, uploads it, and creates an image block.
export async function addImageBlock(notebookId, file, position = {}) {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    throw new Error('Only image files can be added to the canvas')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const ext = extFromFile(file)
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('notebook-images')
    .upload(path, file, { contentType: file.type })
  if (uploadError) throw uploadError

  return createBlock(notebookId, 'image', position, {
    storagePath: `notebook-images/${path}`,
    alt: '',
  })
}

// Private bucket — image blocks need a short-lived signed URL to render.
export async function getImageSignedUrl(storagePath, expiresInSeconds = 3600) {
  const path = storagePath.replace(/^notebook-images\//, '')
  const { data, error } = await supabase.storage
    .from('notebook-images')
    .createSignedUrl(path, expiresInSeconds)
  if (error) throw error
  return data.signedUrl
}

function extractYouTubeVideoId(url) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  if (!YOUTUBE_HOST_RE.test(parsed.hostname)) return null

  if (parsed.hostname.toLowerCase() === 'youtu.be') {
    return parsed.pathname.slice(1).split('/')[0] || null
  }
  if (parsed.pathname.startsWith('/shorts/')) {
    return parsed.pathname.split('/')[2] || null
  }
  if (parsed.pathname.startsWith('/embed/')) {
    return parsed.pathname.split('/')[2] || null
  }
  if (parsed.pathname === '/watch') {
    return parsed.searchParams.get('v')
  }
  return null
}

// Detects YouTube vs. generic URL and creates the matching link block.
export async function addLinkBlock(notebookId, url, position = {}) {
  const videoId = extractYouTubeVideoId(url)

  if (videoId) {
    return createBlock(notebookId, 'link', position, {
      kind: 'youtube',
      url,
      videoId,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    })
  }

  let title = null
  let favicon = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await supabase.functions.invoke('link-preview', {
      body: { url },
      headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
    })
    if (!res.error && res.data) {
      title = res.data.title ?? null
      favicon = res.data.favicon ?? null
    }
  } catch {
    // fall back to nulls per FR-010 edge case — never blocks link creation
  }

  return createBlock(notebookId, 'link', position, { kind: 'bookmark', url, title, favicon })
}

const SAVE_DEBOUNCE_MS = 1500
const pendingSaves = new Map()

// Debounced wrapper around updateBlock, reporting 'saving' | 'saved' | 'error'.
export function scheduleBlockSave(blockId, patch, onStatusChange) {
  const existing = pendingSaves.get(blockId)
  if (existing) clearTimeout(existing.timer)

  const merged = { ...(existing?.patch ?? {}), ...patch }

  const timer = setTimeout(async () => {
    pendingSaves.delete(blockId)
    onStatusChange?.('saving')
    try {
      await updateBlock(blockId, merged)
      onStatusChange?.('saved')
    } catch (err) {
      console.error('[notebookService] scheduleBlockSave failed', err)
      onStatusChange?.('error')
    }
  }, SAVE_DEBOUNCE_MS)

  pendingSaves.set(blockId, { timer, patch: merged })
}
