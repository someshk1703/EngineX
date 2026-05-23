import { useState, useEffect, useRef, useCallback } from 'react'
import { CATEGORIES, ALL_CHAPTERS as CHAPTERS } from './data/topics'
import { getDocsUrl } from './data/docsMap'
import {
  generateChapterContent,
  generateChapterQuiz,
  generateChatMessage,
  hasApiKey,
  getApiKey,
  setApiKey as saveApiKey,
  getProvider,
  setProvider,
  getGitHubPat,
  setGitHubPat,
  getGeminiKey,
  setGeminiKey,
  getOpenAiKey,
  setOpenAiKey,
  getSelectedModel,
  setSelectedModel,
  getReferenceUrls,
  setReferenceUrls,
  ANTHROPIC_MODELS,
  GITHUB_MODELS,
  GEMINI_MODELS,
  OPENAI_MODELS,
  REFERENCE_DOCS,
  resolveModel,
} from './services/claudeService'

// ─── Constants ────────────────────────────────────────────────────────────────
const PROGRESS_KEY = 'enginex_progress'
const NOTES_KEY    = 'enginex_notes'
const STREAK_KEY   = 'enginex_streak'
const THEME_KEY    = 'enginex_theme'

function loadNotes() {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}') } catch { return {} }
}
function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
}

function loadStreak() {
  try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"count":0,"lastDate":null}') } catch { return { count: 0, lastDate: null } }
}
function updateStreak() {
  const today = new Date().toDateString()
  const prev  = loadStreak()
  if (prev.lastDate === today) return prev
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
  const count = prev.lastDate === yesterday.toDateString() ? prev.count + 1 : 1
  const next = { count, lastDate: today }
  localStorage.setItem(STREAK_KEY, JSON.stringify(next))
  return next
}

const QUIZ_QUESTION_COUNT = { Easy: 5, Medium: 8, Hard: 12 }

const LOADING_LOGS_CONTENT = (chapterTitle) => [
  { text: '> Initializing EngineX AI Engine...', color: 'cyan' },
  { text: `> Provider: ${getProvider()} — model: ${resolveModel(getProvider(), getSelectedModel())}`, color: 'yellow' },
  { text: `> Compiling prompt context: "${chapterTitle}"`, color: '' },
  { text: '> Fetching knowledge graph from corpus...', color: 'cyan' },
  { text: '> Streaming tokens from inference layer...', color: '' },
  { text: '> Parsing markdown schema...', color: 'yellow' },
  { text: '> Rendering educational content...', color: 'green' },
]

const LOADING_LOGS_QUIZ = (chapterTitle) => [
  { text: '> Initializing Quiz Generator...', color: 'cyan' },
  { text: `> Target chapter: "${chapterTitle}"`, color: '' },
  { text: '> Prompting MCQ synthesis model...', color: 'yellow' },
  { text: '> Validating JSON schema output...', color: '' },
  { text: '> Randomizing distractor options...', color: 'cyan' },
  { text: '> Calibrating difficulty matrix...', color: 'yellow' },
  { text: '> Building quiz payload...', color: 'green' },
]

// ─── Markdown → HTML ─────────────────────────────────────────────────────────
// Returns HTML string; copy buttons are wired up imperatively via useEffect in ChapterView
function markdownToHtml(md) {
  if (!md) return ''

  const escHtml = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Stash code blocks to protect them from inline processing
  const codeBlocks = []
  let html = md.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length
    const escaped = escHtml(code.trim())
    codeBlocks.push(
      `<div class="code-block-wrapper">` +
      `<div class="code-block-header"><span class="code-lang">${lang || 'text'}</span>` +
      `<button class="copy-code-btn" data-code="${escaped.replace(/"/g, '&quot;')}">Copy</button></div>` +
      `<pre><code class="language-${lang || 'text'}">${escaped}</code></pre></div>`
    )
    return `\x00CODE${idx}\x00`
  })

  const inline = (text) =>
    text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')

  const lines = html.split('\n')
  const result = []
  let inUl = false
  let inOl = false
  let sectionOpen = false

  const closeList = () => {
    if (inUl) { result.push('</ul>'); inUl = false }
    if (inOl) { result.push('</ol>'); inOl = false }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.includes('\x00CODE')) {
      closeList()
      result.push(line)
      continue
    }

    if (line.trim() === '---') { closeList(); result.push('<hr>'); continue }

    const h4 = line.match(/^#### (.+)/); if (h4) { closeList(); result.push(`<h4>${inline(h4[1])}</h4>`); continue }
    const h3 = line.match(/^### (.+)/);  if (h3) { closeList(); result.push(`<h3>${inline(h3[1])}</h3>`); continue }

    // H2 → collapsible section
    const h2 = line.match(/^## (.+)/)
    if (h2) {
      closeList()
      if (sectionOpen) result.push('</div></details>')
      const id = `sec-${i}`
      result.push(
        `<details class="chapter-section" open><summary class="section-summary"><span>${inline(h2[1])}</span><span class="section-chevron">▾</span></summary>` +
        `<div class="section-body">`
      )
      sectionOpen = true
      continue
    }

    const h1 = line.match(/^# (.+)/)
    if (h1) { closeList(); result.push(`<h1>${inline(h1[1])}</h1>`); continue }

    const bq = line.match(/^> (.+)/)
    if (bq) { closeList(); result.push(`<blockquote><p>${inline(bq[1])}</p></blockquote>`); continue }

    const ul = line.match(/^[-*] (.+)/)
    if (ul) {
      if (inOl) { result.push('</ol>'); inOl = false }
      if (!inUl) { result.push('<ul>'); inUl = true }
      result.push(`<li>${inline(ul[1])}</li>`)
      continue
    }

    const ol = line.match(/^\d+\. (.+)/)
    if (ol) {
      if (inUl) { result.push('</ul>'); inUl = false }
      if (!inOl) { result.push('<ol>'); inOl = true }
      result.push(`<li>${inline(ol[1])}</li>`)
      continue
    }

    if (line.trim() === '') { closeList(); continue }

    closeList()
    result.push(`<p>${inline(line)}</p>`)
  }

  closeList()
  if (sectionOpen) result.push('</div></details>')

  let finalHtml = result.join('\n')
  codeBlocks.forEach((block, idx) => {
    finalHtml = finalHtml.replace(`\x00CODE${idx}\x00`, block)
  })
  return finalHtml
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {} }
  catch { return {} }
}
function saveProgress(prog) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(prog))
}

// ─── Terminal Loader ──────────────────────────────────────────────────────────
function TerminalLoader({ logs, visibleCount }) {
  return (
    <div className="terminal-loader glow-pulse" style={{ margin: '60px auto', maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div className="terminal-dot" />
        <div className="terminal-dot yellow" />
        <div className="terminal-dot green" />
        <span style={{ marginLeft: 12, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: 1 }}>
          enginex — ai-engine
        </span>
      </div>
      {logs.slice(0, visibleCount).map((log, i) => (
        <div key={i} className={`terminal-log-line ${log.color}`}>
          {log.text}
        </div>
      ))}
      {visibleCount <= logs.length && (
        <div className="terminal-log-line cyan" style={{ marginTop: 8 }}>
          <span className="terminal-cursor" />
        </div>
      )}
    </div>
  )
}

// ─── Curated docs read-only panel ────────────────────────────────────────────
function CuratedDocsPanel() {
  const [openCat, setOpenCat] = useState(null)
  const totalCount = Object.values(REFERENCE_DOCS).reduce((s, arr) => s + arr.length, 0)

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
          CURATED OFFICIAL DOCS
        </label>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: 1,
          padding: '2px 8px', borderRadius: 4,
          background: 'rgba(0,255,102,0.08)', border: '1px solid rgba(0,255,102,0.25)',
          color: 'var(--accent-green)',
        }}>
          ● ALWAYS ACTIVE — {totalCount} sources
        </span>
      </div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.6 }}>
        Injected automatically per chapter category. Click a category to inspect its sources.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {Object.entries(REFERENCE_DOCS).map(([cat, docs]) => (
          <div key={cat} style={{ border: '1px solid var(--border-color)', borderRadius: 6, overflow: 'hidden' }}>
            <button
              onClick={() => setOpenCat(openCat === cat ? null : cat)}
              style={{
                width: '100%', background: openCat === cat ? 'rgba(0,212,255,0.05)' : 'var(--bg-secondary)',
                border: 'none', padding: '9px 14px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'background 0.2s',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: openCat === cat ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>
                {cat}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {docs.length} source{docs.length !== 1 ? 's' : ''} {openCat === cat ? '▲' : '▼'}
              </span>
            </button>
            {openCat === cat && (
              <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderTop: '1px solid var(--border-color)' }}>
                {docs.map(({ label, url }) => (
                  <div key={url} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 12, flexShrink: 0 }}>{url.replace('https://', '')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Reusable styled input ────────────────────────────────────────────────────
function SettingsInput({ label, type = 'text', value, onChange, placeholder, mono = true }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', color: 'var(--accent-cyan)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
          borderRadius: 4, padding: '10px 14px', color: 'var(--text-primary)',
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
          fontSize: '0.88rem', outline: 'none', transition: 'border-color 0.2s',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--accent-cyan)')}
        onBlur={(e)  => (e.target.style.borderColor = 'var(--border-color)')}
      />
    </div>
  )
}

// ─── Settings Modal ───────────────────────────────────────────────────────────
const MODEL_LISTS = {
  anthropic: ANTHROPIC_MODELS,
  github:    GITHUB_MODELS,
  gemini:    GEMINI_MODELS,
  openai:    OPENAI_MODELS,
}

function SettingsModal({ onClose, onSave }) {
  const [provider, setProviderState] = useState(getProvider)
  const [anthropicKey, setAnthropicKey] = useState(getApiKey)
  const [githubPat, setGithubPat]     = useState(getGitHubPat)
  const [geminiKey, setGeminiKeyState] = useState(getGeminiKey)
  const [openAiKey, setOpenAiKeyState] = useState(getOpenAiKey)
  const [model, setModelState]         = useState(getSelectedModel)
  const [refUrls, setRefUrlsState]     = useState(() => getReferenceUrls().join('\n'))
  const [saved, setSaved] = useState(false)

  const models = MODEL_LISTS[provider] || ANTHROPIC_MODELS

  // Keep model in sync when switching provider.
  // "auto" is valid for all providers so it's always preserved.
  const handleProviderChange = (p) => {
    setProviderState(p)
    if (model !== 'auto') {
      const list = MODEL_LISTS[p] || ANTHROPIC_MODELS
      if (!list.find(m => m.id === model)) setModelState('auto')
    }
  }

  const handleSave = () => {
    setProvider(provider)
    if (provider === 'anthropic') saveApiKey(anthropicKey.trim())
    if (provider === 'github')    setGitHubPat(githubPat.trim())
    if (provider === 'gemini')    setGeminiKey(geminiKey.trim())
    if (provider === 'openai')    setOpenAiKey(openAiKey.trim())
    setSelectedModel(model)
    setReferenceUrls(refUrls.split('\n').map(u => u.trim()).filter(Boolean))
    onSave()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabStyle = (active) => ({
    flex: 1, padding: '10px 0', background: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-mono)', fontSize: '0.82rem', letterSpacing: 1,
    border: 'none', borderBottom: `2px solid ${active ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
    color: active ? 'var(--accent-cyan)' : 'var(--text-muted)',
    transition: 'all 0.2s',
  })

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="terminal-window" style={{ width: '100%', maxWidth: 620 }}>
        <div className="terminal-header">
          <div className="terminal-dots">
            <div className="terminal-dot" />
            <div className="terminal-dot yellow" />
            <div className="terminal-dot green" />
          </div>
          <span className="terminal-title">⚙ SETTINGS — AI PROVIDER</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
        </div>

        <div className="terminal-body">
          {/* Provider tabs */}
          <div style={{ display: 'flex', marginBottom: 24, flexWrap: 'wrap', gap: 2 }}>
            <button style={tabStyle(provider === 'anthropic')} onClick={() => handleProviderChange('anthropic')}>
              ANTHROPIC
            </button>
            <button style={tabStyle(provider === 'github')} onClick={() => handleProviderChange('github')}>
              GITHUB
            </button>
            <button style={tabStyle(provider === 'gemini')} onClick={() => handleProviderChange('gemini')}>
              GEMINI ✦ FREE
            </button>
            <button style={tabStyle(provider === 'openai')} onClick={() => handleProviderChange('openai')}>
              OPENAI
            </button>
          </div>

          {/* Anthropic panel */}
          {provider === 'anthropic' && (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.6 }}>
                Use your own <span style={{ color: 'var(--accent-cyan)' }}>Anthropic API key</span>.
                Keys are stored in <code>localStorage</code> and sent directly to <code>api.anthropic.com</code> — never via a server.
              </p>
              <SettingsInput
                label="ANTHROPIC_API_KEY"
                type="password"
                value={anthropicKey}
                onChange={setAnthropicKey}
                placeholder="sk-ant-api03-..."
              />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                Get a key → <span style={{ color: 'var(--accent-cyan)' }}>console.anthropic.com/keys</span>
              </p>
            </div>
          )}

          {/* GitHub Models panel */}
          {provider === 'github' && (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12, lineHeight: 1.6 }}>
                Use your <span style={{ color: 'var(--accent-cyan)' }}>GitHub Copilot subscription</span> or free GitHub Models access.
                Generate a Personal Access Token — no credit card needed if you have a GitHub account.
              </p>
              <a
                href="https://github.com/settings/tokens/new?scopes=models%3Aread&description=EngineX+AI"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block', marginBottom: 16,
                  padding: '9px 18px', borderRadius: 6, cursor: 'pointer',
                  background: 'rgba(0,212,255,0.08)', border: '1px solid var(--accent-cyan)',
                  color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                  textDecoration: 'none', letterSpacing: 1,
                }}
              >
                ↗ Generate GitHub PAT (opens github.com)
              </a>
              <SettingsInput
                label="GITHUB_PERSONAL_ACCESS_TOKEN"
                type="password"
                value={githubPat}
                onChange={setGithubPat}
                placeholder="github_pat_..."
              />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.7 }}>
                The link above pre-selects the <code>models:read</code> scope. Paste the generated token above.<br />
                <span style={{ color: 'rgba(255,165,0,0.7)' }}>⚠ Note: GitHub OAuth login (SSO) requires a backend proxy due to browser CORS restrictions. PAT is the direct equivalent and has identical model access.</span>
              </p>
            </div>
          )}

          {/* Gemini panel */}
          {provider === 'gemini' && (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.6 }}>
                Use <span style={{ color: 'var(--accent-cyan)' }}>Google Gemini API</span> — Gemini 2.5 Flash has a
                generous <span style={{ color: 'var(--accent-green)' }}>free tier</span> with no credit card required.
                Keys go directly to <code>generativelanguage.googleapis.com</code>.
              </p>
              <SettingsInput
                label="GEMINI_API_KEY"
                type="password"
                value={geminiKey}
                onChange={setGeminiKeyState}
                placeholder="AIza..."
              />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                Get a free key → <span style={{ color: 'var(--accent-cyan)' }}>aistudio.google.com/apikey</span>
              </p>
            </div>
          )}

          {/* OpenAI panel */}
          {provider === 'openai' && (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.6 }}>
                Use your <span style={{ color: 'var(--accent-cyan)' }}>OpenAI API key</span>.
                <code>gpt-4o-mini</code> is the most cost-effective option.
                Keys go directly to <code>api.openai.com</code>.
              </p>
              <SettingsInput
                label="OPENAI_API_KEY"
                type="password"
                value={openAiKey}
                onChange={setOpenAiKeyState}
                placeholder="sk-proj-..."
              />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                Get a key → <span style={{ color: 'var(--accent-cyan)' }}>platform.openai.com/api-keys</span>
              </p>
            </div>
          )}

          {/* Model selector (shared) */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: 'var(--accent-cyan)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>
              MODEL
            </label>
            <select
              value={model}
              onChange={(e) => setModelState(e.target.value)}
              style={{
                width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                borderRadius: 4, padding: '10px 14px', color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)', fontSize: '0.88rem', outline: 'none', cursor: 'pointer',
              }}
            >
              {models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>

          {/* Curated docs — always-on, read-only overview */}
          <CuratedDocsPanel />

          {/* Extra URLs */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: 'var(--accent-cyan)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>
              EXTRA REFERENCE URLS <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(one per line — added on top of curated docs)</span>
            </label>
            <textarea
              value={refUrls}
              onChange={(e) => setRefUrlsState(e.target.value)}
              placeholder={`https://your-internal-wiki.com/backend-guide\nhttps://company-standards.dev`}
              rows={3}
              style={{
                width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                borderRadius: 4, padding: '10px 14px', color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)', fontSize: '0.8rem', outline: 'none',
                resize: 'vertical', transition: 'border-color 0.2s', lineHeight: 1.6,
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-cyan)')}
              onBlur={(e)  => (e.target.style.borderColor = 'var(--border-color)')}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className={`btn-console ${saved ? 'btn-console-success' : ''}`} onClick={handleSave}>
              {saved ? '✓ SAVED' : '> SAVE SETTINGS'}
            </button>
            <button
              className="btn-console"
              style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
              onClick={() => {
                saveApiKey(''); setGitHubPat(''); setGeminiKey(''); setOpenAiKey('')
                setAnthropicKey(''); setGithubPat(''); setGeminiKeyState(''); setOpenAiKeyState('')
                setReferenceUrls([]); setRefUrlsState('')
                onSave()
              }}
            >
              CLEAR ALL
            </button>
            <button className="btn-console" onClick={onClose} style={{ marginLeft: 'auto' }}>CLOSE</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Chapter Card ─────────────────────────────────────────────────────────────
function ChapterCard({ chapter, progress, onClick }) {
  const chProg = progress[chapter.id]
  const isRead = !!chProg?.read
  const quizScore = chProg?.quizScore
  const hasQuiz = quizScore !== undefined

  return (
    <div className={`chapter-card ${isRead ? 'completed' : ''}`} onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: 1,
          color: 'var(--accent-cyan)', border: '1px solid rgba(0,212,255,0.3)',
          padding: '2px 8px', borderRadius: 4, background: 'rgba(0,212,255,0.05)',
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

// ─── Library View ─────────────────────────────────────────────────────────────
function LibraryView({ progress, onOpenChapter }) {
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default') // 'default' | 'quiz-asc' | 'quiz-desc' | 'recent'

  const filtered = CHAPTERS.filter(c => {
    const matchCat = activeCategory === 'ALL' || c.category === activeCategory
    const q = search.toLowerCase().trim()
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q))
    return matchCat && matchSearch
  }).sort((a, b) => {
    if (sortBy === 'quiz-asc') {
      const sa = progress[a.id]?.quizScore ?? Infinity
      const sb = progress[b.id]?.quizScore ?? Infinity
      return sa - sb
    }
    if (sortBy === 'quiz-desc') {
      const sa = progress[a.id]?.quizScore ?? -Infinity
      const sb = progress[b.id]?.quizScore ?? -Infinity
      return sb - sa
    }
    if (sortBy === 'recent') {
      const da = progress[a.id]?.quizDate || progress[a.id]?.readDate || ''
      const db = progress[b.id]?.quizDate || progress[b.id]?.readDate || ''
      return db > da ? 1 : -1
    }
    return 0 // default order
  })

  return (
    <div style={{ display: 'flex', gap: 28, minHeight: 'calc(100vh - 120px)' }}>
      {/* Sidebar */}
      <div style={{ width: 240, flexShrink: 0 }}>
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 12 }}>
            CATEGORIES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              className={`category-btn ${activeCategory === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveCategory('ALL')}
            >
              <span>◈</span>
              <span>All Topics</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {CHAPTERS.length}
              </span>
            </button>
            {CATEGORIES.map(cat => {
              const count = CHAPTERS.filter(c => c.category === cat.id).length
              const completed = CHAPTERS.filter(c => c.category === cat.id && progress[c.id]?.read).length
              return (
                <button
                  key={cat.id}
                  className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span>{cat.icon}</span>
                  <span style={{ flex: 1, fontSize: '0.88rem' }}>{cat.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: completed === count ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {completed}/{count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Chapter Grid */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 16 }}>
          <input
            className="search-bar"
            type="text"
            placeholder="🔍  Search chapters, tags, topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {filtered.length} chapter{filtered.length !== 1 ? 's' : ''}
          </span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 6,
              color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
              padding: '5px 10px', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="default">Default order</option>
            <option value="recent">Recently viewed</option>
            <option value="quiz-asc">Score: Low → High</option>
            <option value="quiz-desc">Score: High → Low</option>
          </select>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {filtered.map(chapter => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              progress={progress}
              onClick={() => onOpenChapter(chapter)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Official Docs Modal ──────────────────────────────────────────────────────
function DocsModal({ chapter, onClose }) {
  const url = getDocsUrl(chapter.title)
  const [iframeBlocked, setIframeBlocked] = useState(false)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', flexDirection: 'column' }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      {/* Modal */}
      <div style={{
        position: 'relative', zIndex: 1, margin: '32px auto', width: 'min(92vw, 1100px)',
        height: 'calc(100vh - 64px)', background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)', borderRadius: 10,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: 1 }}>OFFICIAL DOCS</span>
          <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
          <a href={url} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none', padding: '4px 10px', border: '1px solid var(--border-color)', borderRadius: 4 }}>
            ↗ Open Tab
          </a>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</button>
        </div>
        {/* iframe or fallback */}
        {!iframeBlocked ? (
          <iframe
            src={url}
            title="Official Documentation"
            style={{ flex: 1, border: 'none', background: '#fff' }}
            onError={() => setIframeBlocked(true)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ fontSize: '2rem' }}>🔒</div>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', textAlign: 'center' }}>
              This site blocked iframe embedding.
            </div>
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn-console">
              ↗ Open in New Tab
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Chatbot starter questions by category ────────────────────────────────────
const STARTER_QUESTIONS = {
  'Data Structures & Algorithms': ['Explain two pointers simply', 'When do I use a sliding window?', 'Show me a real interview example'],
  'System Design & Architecture': ['How would you scale this for 1M users?', 'What are the key tradeoffs here?', 'Draw the architecture diagram'],
  'Full Stack Development': ['Show a real-world code example', 'What are common interview mistakes?', 'What do senior engineers do differently?'],
  'Cloud & DevOps': ['When would you use this over alternatives?', 'Walk me through a production incident', 'What does an SRE need to know here?'],
  'Database & Storage Systems': ['Explain indexing in simple terms', 'When would you choose NoSQL?', 'What causes slow queries?'],
  'Security & Cryptography': ['What are the most common vulnerabilities?', 'Give me a real attack example', 'How do FAANG companies handle this?'],
  'CS Fundamentals': ['Give me an analogy for this', 'How does this work in the browser?', 'What interview questions cover this?'],
  'Soft Skills & Leadership': ['Give me a STAR method example', 'What do Big 4 interviewers look for?', 'How would you handle a conflict?'],
}

// ─── Chatbot Panel ────────────────────────────────────────────────────────────
function ChatbotPanel({ chapter, isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi! I'm your AI coach for **${chapter.title}**. Ask me anything about this topic — concepts, code examples, interview tips, or quick quiz questions!` }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setSending(true)
    try {
      const reply = await generateChatMessage(chapter, messages, text)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠ Error: ${err.message}. Make sure your API key is configured in Settings.` }])
    } finally {
      setSending(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  // Simple inline markdown for chat bubbles
  const renderMsg = (text) => text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>')

  return (
    <div className={`chatbot-panel ${isOpen ? '' : 'hidden'}`}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: 2 }}>AI COACH</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginTop: 2 }}>{chapter.title}</div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1 }}
        >✕</button>
      </div>

      {/* Messages */}
      <div className="chatbot-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>
            <span dangerouslySetInnerHTML={{ __html: renderMsg(m.content) }} />
          </div>
        ))}
        {sending && (
          <div className="chat-bubble assistant" style={{ opacity: 0.6 }}>
            <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: 2 }}>▋ thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Starter question chips — only show when only the initial message exists */}
      {messages.length === 1 && !sending && (
        <div style={{ padding: '0 12px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(STARTER_QUESTIONS[chapter.category] || STARTER_QUESTIONS['CS Fundamentals']).map((q) => (
            <button
              key={q}
              onClick={() => { setInput(q); }}
              style={{
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 16,
                padding: '5px 11px', fontSize: '0.78rem', color: 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.color = 'var(--accent-cyan)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >{q}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chat-input-bar">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask anything about this topic..."
          disabled={sending}
        />
        <button className="chat-send-btn" onClick={send} disabled={sending || !input.trim()}>
          ↑
        </button>
      </div>
    </div>
  )
}

// ─── Notes Panel ──────────────────────────────────────────────────────────────
function NotesPanel({ chapterId }) {
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState(() => loadNotes()[chapterId] || '')

  const handleChange = (e) => {
    const val = e.target.value
    setNotes(val)
    const all = loadNotes()
    all[chapterId] = val
    saveNotes(all)
  }

  return (
    <div style={{ marginTop: 24, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: 1,
        }}
      >
        <span>📝  MY NOTES</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div style={{ padding: '0 16px 16px' }}>
          <textarea
            className="notes-textarea"
            value={notes}
            onChange={handleChange}
            placeholder="Jot down key points, mnemonics, or things you want to remember..."
            rows={6}
          />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Auto-saved to browser storage
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Chapter View ─────────────────────────────────────────────────────────────
function ChapterView({ chapter, onBack, onStartQuiz, progress, onMarkRead }) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visibleLogs, setVisibleLogs] = useState(0)
  const [chatOpen, setChatOpen] = useState(false)
  const [showDocs, setShowDocs] = useState(false)
  const [scrollPct, setScrollPct] = useState(0)
  // TTS state
  const [ttsPlaying, setTtsPlaying] = useState(false)
  const [ttsSupported] = useState(() => 'speechSynthesis' in window)
  const utteranceRef = useRef(null)
  const logs = LOADING_LOGS_CONTENT(chapter.title)
  const intervalRef = useRef(null)
  const contentRef = useRef(null)

  // Scroll progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop || document.body.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setScrollPct(total > 0 ? Math.round((scrolled / total) * 100) : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Wire up copy buttons after content renders
  useEffect(() => {
    if (!contentRef.current) return
    const buttons = contentRef.current.querySelectorAll('.copy-code-btn')
    buttons.forEach((btn) => {
      btn.onclick = () => {
        const code = btn.getAttribute('data-code')
          .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = 'Copied!'
          setTimeout(() => { btn.textContent = 'Copy' }, 2000)
        }).catch(() => {})
      }
    })
  }, [content, isLoading])

  // TTS cleanup on unmount / chapter change
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); setTtsPlaying(false) }
  }, [chapter])

  const handleTtsPlay = () => {
    if (!ttsSupported) return
    window.speechSynthesis.cancel()
    const text = contentRef.current?.innerText || ''
    utteranceRef.current = new SpeechSynthesisUtterance(text)
    utteranceRef.current.rate = 1
    const voices = window.speechSynthesis.getVoices()
    const natural = voices.find(v => v.lang.startsWith('en') && v.localService)
    if (natural) utteranceRef.current.voice = natural
    utteranceRef.current.onend = () => setTtsPlaying(false)
    utteranceRef.current.onerror = () => setTtsPlaying(false)
    window.speechSynthesis.speak(utteranceRef.current)
    setTtsPlaying(true)
  }

  const handleTtsPause = () => {
    if (ttsPlaying) { window.speechSynthesis.pause(); setTtsPlaying(false) }
    else { window.speechSynthesis.resume(); setTtsPlaying(true) }
  }

  const handleTtsStop = () => {
    window.speechSynthesis.cancel()
    setTtsPlaying(false)
  }

  const loadContent = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setVisibleLogs(0)

    let logIdx = 0
    intervalRef.current = setInterval(() => {
      logIdx++
      setVisibleLogs(logIdx)
      if (logIdx >= logs.length) clearInterval(intervalRef.current)
    }, 320)

    try {
      let text
      if (hasApiKey()) {
        text = await generateChapterContent(chapter)
      } else {
        await new Promise(r => setTimeout(r, logs.length * 320 + 400))
        text = chapter.fallbackContent
      }
      setContent(text)
      onMarkRead(chapter.id)
    } catch (err) {
      setError(err.message || 'Failed to load content.')
      setContent(chapter.fallbackContent)
    } finally {
      clearInterval(intervalRef.current)
      setVisibleLogs(logs.length + 1)
      setIsLoading(false)
    }
  }, [chapter])

  useEffect(() => {
    loadContent()
    return () => clearInterval(intervalRef.current)
  }, [loadContent])

  const chProg = progress[chapter.id]
  const quizScore = chProg?.quizScore

  return (
    <>
      {/* Scroll progress bar */}
      <div style={{ position: 'fixed', top: 60, left: 0, right: 0, height: 3, zIndex: 99, background: 'var(--bg-tertiary)' }}>
        <div style={{ height: '100%', width: `${scrollPct}%`, background: 'var(--accent-cyan)', transition: 'width 0.1s', boxShadow: '0 0 8px var(--accent-cyan-glow)' }} />
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Breadcrumb + action bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <button className="btn-console" onClick={onBack} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
            ← LIBRARY
          </button>
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {chapter.category} / {chapter.title}
          </span>

          {/* TTS controls */}
          {ttsSupported && !isLoading && content && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="tts-btn" onClick={ttsPlaying ? handleTtsPause : handleTtsPlay} title={ttsPlaying ? 'Pause' : 'Play'}>
                {ttsPlaying ? '⏸' : '▶'}
              </button>
              <button className="tts-btn" onClick={handleTtsStop} title="Stop" disabled={!ttsPlaying}>⏹</button>
            </div>
          )}

          {/* Official Docs */}
          <button className="btn-console" onClick={() => setShowDocs(true)} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
            📄 DOCS
          </button>

          {!hasApiKey() && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-yellow)', border: '1px solid rgba(255,204,0,0.3)', padding: '2px 10px', borderRadius: 4 }}>
              DEMO
            </span>
          )}
        </div>

        {/* Loading */}
        {isLoading && <TerminalLoader logs={logs} visibleCount={visibleLogs} />}

        {/* Error banner */}
        {error && !isLoading && (
          <div style={{ background: 'rgba(255,51,102,0.08)', border: '1px solid var(--accent-red)', borderRadius: 6, padding: '12px 16px', marginBottom: 20, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-red)' }}>
            ⚠ API Error: {error} — Displaying demo content.
          </div>
        )}

        {/* Content */}
        {!isLoading && content && (
          <>
            <div
              ref={contentRef}
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
            />

            {/* Quiz CTA */}
            <div style={{
              marginTop: 48, padding: 28, background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 16,
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 4 }}>
                  KNOWLEDGE CHECK
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Test your understanding
                </div>
                {quizScore !== undefined && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: quizScore >= 70 ? 'var(--accent-green)' : 'var(--accent-yellow)', marginTop: 4 }}>
                    Last score: {quizScore}%
                  </div>
                )}
              </div>
              <button className="btn-console btn-console-success" onClick={onStartQuiz} style={{ fontSize: '0.95rem', padding: '12px 24px' }}>
                ▶ TAKE QUIZ
              </button>
            </div>

            {/* Notes */}
            <NotesPanel chapterId={chapter.id} />
          </>
        )}
      </div>

    {/* Chatbot FAB */}
    {hasApiKey() && (
      <button className="chatbot-fab" onClick={() => setChatOpen(o => !o)} title="AI Coach">
        {chatOpen ? '✕' : '💬'}
      </button>
    )}

    {/* Chatbot Panel */}
    {hasApiKey() && (
      <ChatbotPanel chapter={chapter} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    )}

    {/* Official Docs Modal */}
    {showDocs && <DocsModal chapter={chapter} onClose={() => setShowDocs(false)} />}
    </>
  )
}

// ─── Quiz View ────────────────────────────────────────────────────────────────
function QuizView({ chapter, onBack, onComplete }) {
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visibleLogs, setVisibleLogs] = useState(0)
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [results, setResults] = useState([])
  const [showSummary, setShowSummary] = useState(false)
  const [elapsed, setElapsed] = useState(0)       // seconds
  const [timerRunning, setTimerRunning] = useState(false)
  const startTimeRef = useRef(null)
  const timerRef = useRef(null)
  const logs = LOADING_LOGS_QUIZ(chapter.title)
  const intervalRef = useRef(null)
  const numQ = QUIZ_QUESTION_COUNT[chapter.complexity] || 8

  const startTimer = () => {
    startTimeRef.current = Date.now()
    setTimerRunning(true)
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
  }

  const stopTimer = () => {
    clearInterval(timerRef.current)
    setTimerRunning(false)
  }

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  useEffect(() => {
    let logIdx = 0
    intervalRef.current = setInterval(() => {
      logIdx++
      setVisibleLogs(logIdx)
      if (logIdx >= logs.length) clearInterval(intervalRef.current)
    }, 280)

    const load = async () => {
      try {
        let quiz
        if (hasApiKey()) {
          quiz = await generateChapterQuiz(chapter, numQ)
        } else {
          await new Promise(r => setTimeout(r, logs.length * 280 + 300))
          quiz = chapter.fallbackQuiz.slice(0, numQ)
        }
        setQuestions(quiz)
        startTimer()
      } catch (err) {
        setError(err.message)
        setQuestions(chapter.fallbackQuiz.slice(0, numQ))
        startTimer()
      } finally {
        clearInterval(intervalRef.current)
        setVisibleLogs(logs.length + 1)
        setIsLoading(false)
      }
    }
    load()
    return () => { clearInterval(intervalRef.current); clearInterval(timerRef.current) }
  }, [chapter])

  const handleSelect = (idx) => {
    if (isAnswered) return
    setSelected(idx)
    setIsAnswered(true)
    const correct = idx === questions[qIndex].correct_index
    setResults(prev => [...prev, { correct, selected: idx }])
  }

  const handleNext = () => {
    if (qIndex + 1 >= questions.length) {
      stopTimer()
      const score = Math.round((results.filter(r => r.correct).length / questions.length) * 100)
      onComplete(score)
      setShowSummary(true)
    } else {
      setQIndex(q => q + 1)
      setSelected(null)
      setIsAnswered(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button className="btn-console" onClick={onBack} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>← CHAPTER</button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Quiz: {chapter.title}
          </span>
        </div>
        <TerminalLoader logs={logs} visibleCount={visibleLogs} />
      </div>
    )
  }

  if (showSummary) {
    const score = Math.round((results.filter(r => r.correct).length / questions.length) * 100)
    return (
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dots">
              <div className="terminal-dot" />
              <div className="terminal-dot yellow" />
              <div className="terminal-dot green" />
            </div>
            <span className="terminal-title">QUIZ COMPLETE — {chapter.title.toUpperCase()}</span>
          </div>
          <div className="terminal-body">
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 12 }}>FINAL SCORE</div>
              <div style={{
                fontSize: '4rem', fontFamily: 'var(--font-mono)', fontWeight: 700,
                color: score >= 80 ? 'var(--accent-green)' : score >= 60 ? 'var(--accent-yellow)' : 'var(--accent-red)',
                textShadow: `0 0 20px ${score >= 80 ? 'var(--accent-green)' : score >= 60 ? 'var(--accent-yellow)' : 'var(--accent-red)'}`,
                marginBottom: 8,
              }}>
                {score}%
              </div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                {results.filter(r => r.correct).length} of {questions.length} correct
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 32 }}>
                ⏱ Time: {fmtTime(elapsed)}
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
                {results.map((r, i) => (
                  <div key={i} style={{
                    width: 32, height: 32, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                    background: r.correct ? 'rgba(0,255,102,0.15)' : 'rgba(255,51,102,0.15)',
                    color: r.correct ? 'var(--accent-green)' : 'var(--accent-red)',
                    border: `1px solid ${r.correct ? 'rgba(0,255,102,0.3)' : 'rgba(255,51,102,0.3)'}`,
                  }}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-console" onClick={onBack}>← BACK TO CHAPTER</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const q = questions[qIndex]
  const letters = ['A', 'B', 'C', 'D']
  const progress = ((qIndex) / questions.length) * 100

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn-console" onClick={onBack} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>← CHAPTER</button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', flex: 1 }}>
          {chapter.title} — Quiz
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          ⏱ {fmtTime(elapsed)}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
          {qIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="progress-bar-container" style={{ marginBottom: 28 }}>
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {error && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-yellow)', marginBottom: 16 }}>
          ⚠ Using demo questions
        </div>
      )}

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '28px 28px 24px', marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 12 }}>
          QUESTION {qIndex + 1}
        </div>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: 0 }}>
          {q.question}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {q.options.map((opt, idx) => {
          let cls = 'quiz-option'
          if (isAnswered) {
            cls += ' disabled'
            if (idx === q.correct_index) cls += ' correct'
            else if (idx === selected) cls += ' incorrect'
          } else if (selected === idx) {
            cls += ' selected'
          }
          return (
            <button key={idx} className={cls} onClick={() => handleSelect(idx)}>
              <span className="quiz-option-letter">{letters[idx]}</span>
              <span style={{ flex: 1 }}>{opt}</span>
            </button>
          )
        })}
      </div>

      {isAnswered && (
        <div style={{
          background: results[results.length - 1].correct ? 'rgba(0,255,102,0.05)' : 'rgba(255,51,102,0.05)',
          border: `1px solid ${results[results.length - 1].correct ? 'rgba(0,255,102,0.3)' : 'rgba(255,51,102,0.3)'}`,
          borderRadius: 6, padding: '16px 20px', marginBottom: 20,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: 1,
            color: results[results.length - 1].correct ? 'var(--accent-green)' : 'var(--accent-red)',
            marginBottom: 8, fontWeight: 700,
          }}>
            {results[results.length - 1].correct ? '✓ CORRECT' : '✗ INCORRECT'}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
            {q.explanation}
          </p>
        </div>
      )}

      {isAnswered && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-console btn-console-success" onClick={handleNext}>
            {qIndex + 1 >= questions.length ? '▶ SEE RESULTS' : 'NEXT QUESTION →'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Dashboard View ───────────────────────────────────────────────────────────
function DashboardView({ progress, onOpenChapter }) {
  const allChapters = CHAPTERS
  const readChapters = allChapters.filter(c => progress[c.id]?.read)
  const quizzedChapters = allChapters.filter(c => progress[c.id]?.quizScore !== undefined)
  const avgScore = quizzedChapters.length
    ? Math.round(quizzedChapters.reduce((s, c) => s + (progress[c.id]?.quizScore || 0), 0) / quizzedChapters.length)
    : 0
  const overallPct = Math.round((readChapters.length / allChapters.length) * 100)

  // Interview readiness: 40% weight on chapters read%, 60% on avg quiz score
  const readinessPct = Math.round(overallPct * 0.4 + (quizzedChapters.length ? avgScore * 0.6 : 0))
  const readinessLabel = readinessPct >= 80 ? '🚀 Interview Ready!' : readinessPct >= 50 ? '📈 On Track' : '🌱 Keep Grinding'

  // Streak
  const streak = loadStreak()

  // Three-days-ago boundary
  const threeDaysAgo = new Date(); threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const dueForReview = quizzedChapters.filter(c => {
    const p = progress[c.id]
    if (p.quizScore < 70) return true
    if (p.quizDate && new Date(p.quizDate) < threeDaysAgo) return true
    return false
  })

  // Build 12-week activity heatmap from quiz dates + read dates
  const today = new Date()
  const heatmap = (() => {
    const counts = {}
    CHAPTERS.forEach(c => {
      const p = progress[c.id]
      if (p?.quizDate) counts[p.quizDate.slice(0, 10)] = (counts[p.quizDate.slice(0, 10)] || 0) + 1
    })
    // Build last 84 days (12 weeks)
    const days = []
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      days.push({ key, count: counts[key] || 0, day: d.getDay() })
    }
    return days
  })()

  return (
    <div>
      {/* Readiness + Streak row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Readiness Score */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '20px 24px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 8 }}>INTERVIEW READINESS</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2.4rem', fontWeight: 700, color: readinessPct >= 80 ? 'var(--accent-green)' : readinessPct >= 50 ? 'var(--accent-yellow)' : 'var(--accent-cyan)', lineHeight: 1 }}>{readinessPct}%</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', paddingBottom: 4 }}>{readinessLabel}</span>
          </div>
          <div className="progress-bar-container" style={{ height: 6 }}>
            <div className="progress-bar-fill" style={{ width: `${readinessPct}%`, background: readinessPct >= 80 ? 'var(--accent-green)' : readinessPct >= 50 ? 'var(--accent-yellow)' : 'var(--accent-cyan)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>
            40% chapters read · 60% quiz performance
          </div>
        </div>

        {/* Streak */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '20px 24px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 8 }}>STUDY STREAK</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2.4rem', fontWeight: 700, color: streak.count >= 7 ? 'var(--accent-green)' : streak.count >= 3 ? 'var(--accent-yellow)' : 'var(--accent-cyan)', lineHeight: 1 }}>
              {streak.count}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', paddingBottom: 4 }}>day{streak.count !== 1 ? 's' : ''} in a row</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {streak.count === 0 ? '🎯 Start your streak today!' : streak.count >= 7 ? '🔥 On fire! Keep it up!' : streak.count >= 3 ? '⚡ Building momentum!' : '✅ Great start!'}
          </div>
          {streak.lastDate && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
              Last studied: {streak.lastDate}
            </div>
          )}
        </div>
      </div>

      {/* Activity Heatmap */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '20px 24px', marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 14 }}>STUDY ACTIVITY — LAST 12 WEEKS</div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {heatmap.map((d) => (
            <div
              key={d.key}
              title={`${d.key}: ${d.count} activity`}
              style={{
                width: 12, height: 12, borderRadius: 2,
                background: d.count === 0
                  ? 'var(--bg-tertiary)'
                  : d.count === 1
                  ? 'rgba(0,212,255,0.25)'
                  : d.count === 2
                  ? 'rgba(0,212,255,0.55)'
                  : 'var(--accent-cyan)',
                border: d.key === today.toISOString().slice(0, 10) ? '1px solid var(--accent-cyan)' : '1px solid transparent',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>Less</span>
          {['var(--bg-tertiary)', 'rgba(0,212,255,0.25)', 'rgba(0,212,255,0.55)', 'var(--accent-cyan)'].map(bg => (
            <div key={bg} style={{ width: 12, height: 12, borderRadius: 2, background: bg }} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="dashboard-grid" style={{ marginBottom: 36 }}>
        {[
          { label: 'CHAPTERS READ', value: `${readChapters.length}/${allChapters.length}`, sub: `${overallPct}% complete` },
          { label: 'QUIZZES TAKEN', value: quizzedChapters.length, sub: 'chapters tested' },
          { label: 'AVG QUIZ SCORE', value: quizzedChapters.length ? `${avgScore}%` : '—', sub: 'across all attempts' },
          { label: 'BEST SCORE', value: quizzedChapters.length ? `${Math.max(...quizzedChapters.map(c => progress[c.id]?.quizScore || 0))}%` : '—', sub: 'single chapter' },
        ].map(m => (
          <div key={m.label} className="metric-card">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: 2 }}>{m.label}</div>
            <div className="metric-value">{m.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>OVERALL PROGRESS</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>{overallPct}%</span>
        </div>
        <div className="progress-bar-container" style={{ height: 10 }}>
          <div className="progress-bar-fill" style={{ width: `${overallPct}%` }} />
        </div>
      </div>

      {/* Per-category progress */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 16 }}>
          CATEGORY BREAKDOWN
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {CATEGORIES.map(cat => {
            const catChapters = allChapters.filter(c => c.category === cat.id)
            const readCount = catChapters.filter(c => progress[c.id]?.read).length
            const quizCount = catChapters.filter(c => progress[c.id]?.quizScore !== undefined).length
            const catAvg = quizCount
              ? Math.round(catChapters.filter(c => progress[c.id]?.quizScore !== undefined).reduce((s, c) => s + (progress[c.id]?.quizScore || 0), 0) / quizCount)
              : null
            const pct = Math.round((readCount / catChapters.length) * 100)
            return (
              <div key={cat.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {readCount}/{catChapters.length} read
                    </span>
                    {catAvg !== null && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: catAvg >= 70 ? 'var(--accent-green)' : 'var(--accent-yellow)' }}>
                        avg {catAvg}%
                      </span>
                    )}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>{pct}%</span>
                  </div>
                </div>
                <div className="progress-bar-container">
                  <div className={`progress-bar-fill ${pct === 100 ? 'success' : ''}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quiz history */}
      {quizzedChapters.length > 0 && (
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 16 }}>
            QUIZ HISTORY
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {quizzedChapters
              .sort((a, b) => (progress[b.id]?.quizDate || '') > (progress[a.id]?.quizDate || '') ? 1 : -1)
              .map(chapter => {
                const chProg = progress[chapter.id]
                return (
                  <div
                    key={chapter.id}
                    style={{
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 6,
                      padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16,
                      cursor: 'pointer', transition: 'border-color 0.2s',
                    }}
                    onClick={() => onOpenChapter(chapter)}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem',
                      background: chProg.quizScore >= 80 ? 'rgba(0,255,102,0.1)' : chProg.quizScore >= 60 ? 'rgba(255,204,0,0.1)' : 'rgba(255,51,102,0.1)',
                      color: chProg.quizScore >= 80 ? 'var(--accent-green)' : chProg.quizScore >= 60 ? 'var(--accent-yellow)' : 'var(--accent-red)',
                    }}>
                      {chProg.quizScore}%
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{chapter.title}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{chapter.category}</div>
                    </div>
                    {chProg.quizDate && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(chProg.quizDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {quizzedChapters.length === 0 && readChapters.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>◈</div>
          <div>No progress yet. Start reading chapters to track your journey.</div>
        </div>
      )}

      {/* Due for Review */}
      {dueForReview.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-yellow)', letterSpacing: 2, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            🔁 DUE FOR REVIEW <span style={{ color: 'var(--text-muted)' }}>— spaced repetition</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dueForReview.slice(0, 8).map(chapter => {
              const chProg = progress[chapter.id]
              const reason = chProg.quizScore < 70 ? `Score: ${chProg.quizScore}% — needs improvement` : 'Quiz was 3+ days ago'
              return (
                <div
                  key={chapter.id}
                  style={{
                    background: 'rgba(255,204,0,0.04)', border: '1px solid rgba(255,204,0,0.2)', borderRadius: 6,
                    padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 16,
                    cursor: 'pointer', transition: 'border-color 0.2s',
                  }}
                  onClick={() => onOpenChapter(chapter)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-yellow)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,204,0,0.2)'}
                >
                  <span style={{ fontSize: '1rem' }}>🔁</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{chapter.title}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-yellow)' }}>{reason}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{chapter.category}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('library')   // 'library' | 'chapter' | 'quiz' | 'dashboard'
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [progress, setProgress] = useState(loadProgress)
  const [showSettings, setShowSettings] = useState(false)
  const [apiConfigured, setApiConfigured] = useState(hasApiKey)
  const [providerLabel, setProviderLabel] = useState(() => getProvider().toUpperCase())
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(THEME_KEY) !== 'light')

  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [darkMode])

  // Update streak on mount
  useEffect(() => { updateStreak() }, [])

  const updateProgress = (updater) => {
    setProgress(prev => {
      const next = updater(prev)
      saveProgress(next)
      return next
    })
  }

  const handleOpenChapter = (chapter) => {
    setSelectedChapter(chapter)
    setView('chapter')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleMarkRead = (chapterId) => {
    updateProgress(prev => ({
      ...prev,
      [chapterId]: { ...prev[chapterId], read: true },
    }))
  }

  const handleQuizComplete = (score) => {
    if (!selectedChapter) return
    updateProgress(prev => ({
      ...prev,
      [selectedChapter.id]: {
        ...prev[selectedChapter.id],
        quizScore: score,
        quizDate: new Date().toISOString(),
      },
    }))
  }

  const overallPct = Math.round((CHAPTERS.filter(c => progress[c.id]?.read).length / CHAPTERS.length) * 100)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border-color)',
        background: darkMode ? 'rgba(10,10,12,0.95)' : 'rgba(244,244,248,0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div className="header-glow-line" />
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', gap: 28 }}>
          {/* Logo */}
          <button
            onClick={() => setView('library')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: 0 }}
          >
            <span style={{
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.2rem',
              color: 'var(--accent-cyan)', letterSpacing: 2,
              textShadow: '0 0 12px rgba(0,212,255,0.4)',
            }}>
              ENGINE<span style={{ color: 'var(--text-primary)' }}>X</span>
            </span>
          </button>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: 4 }}>
            {[
              { label: 'Library', val: 'library' },
              { label: 'Dashboard', val: 'dashboard' },
            ].map(({ label, val }) => (
              <button
                key={val}
                onClick={() => setView(val)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '6px 14px', borderRadius: 4,
                  fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: 0.5,
                  color: view === val ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  borderBottom: view === val ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Progress pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 20, padding: '4px 12px' }}>
              <div style={{ width: 60, height: 4, background: 'var(--bg-primary)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${overallPct}%`, background: 'var(--accent-cyan)', borderRadius: 2, transition: 'width 0.4s' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{overallPct}%</span>
            </div>

            {/* API status */}
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: 1,
              padding: '3px 10px', borderRadius: 4, border: '1px solid',
              borderColor: apiConfigured ? 'rgba(0,255,102,0.3)' : 'rgba(255,204,0,0.3)',
              color: apiConfigured ? 'var(--accent-green)' : 'var(--accent-yellow)',
              background: apiConfigured ? 'rgba(0,255,102,0.05)' : 'rgba(255,204,0,0.05)',
            }}>
              {apiConfigured ? `● LIVE · ${providerLabel}` : '● DEMO MODE'}
            </div>

            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(d => !d)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? '☀' : '🌙'}
            </button>

            {/* Settings */}
            <button
              className="btn-console"
              onClick={() => setShowSettings(true)}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              ⚙ SETTINGS
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 1400, width: '100%', margin: '0 auto', padding: '32px 28px' }}>
        {view === 'library' && (
          <LibraryView progress={progress} onOpenChapter={handleOpenChapter} />
        )}
        {view === 'chapter' && selectedChapter && (
          <ChapterView
            chapter={selectedChapter}
            progress={progress}
            onBack={() => setView('library')}
            onStartQuiz={() => setView('quiz')}
            onMarkRead={handleMarkRead}
          />
        )}
        {view === 'quiz' && selectedChapter && (
          <QuizView
            chapter={selectedChapter}
            onBack={() => setView('chapter')}
            onComplete={handleQuizComplete}
          />
        )}
        {view === 'dashboard' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>Progress Dashboard</h1>
              <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                Your FAANG preparation journey
              </p>
            </div>
            <DashboardView progress={progress} onOpenChapter={handleOpenChapter} />
          </div>
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSave={() => { setApiConfigured(hasApiKey()); setProviderLabel(getProvider().toUpperCase()) }}
        />
      )}
    </div>
  )
}
