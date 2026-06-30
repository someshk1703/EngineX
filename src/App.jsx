import { useState, useEffect, useRef, useCallback } from 'react'
import { CATEGORIES, ALL_CHAPTERS as CHAPTERS } from './data/topics'
import { getDocsUrl } from './data/docsMap'
import { HTML_SECTIONS, hasTheory } from './data/htmlContent'
import { DSA_QUESTIONS, JAVA_QUESTIONS } from './data/questions'
import FlashcardManager from './components/FlashcardManager'
import StaticContentViewer from './components/StaticContentViewer'
import InterviewWhiteboard from './components/InterviewWhiteboard'
import { supabase, signInWithGoogle, signInWithGitHub, signOut } from './services/supabaseClient'
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

// Questions per category
const QUESTIONS_MAP = { DSA: DSA_QUESTIONS, Java: JAVA_QUESTIONS }

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

  // Always reset model to "auto" when switching provider so the best model
  // for that subscription is selected automatically.
  const handleProviderChange = (p) => {
    setProviderState(p)
    setModelState('auto')
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

// HtmlViewer removed — StaticContentViewer handles theory content inline

// ─── Difficulty badge ─────────────────────────────────────────────────────────
function DiffBadge({ difficulty }) {
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

// ─── Questions Panel (DSA coding problems + Java conceptual Q&A) ──────────────
function QuestionsPanel({ questions = [], type = 'dsa' }) {
  const [filter, setFilter]   = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [showHint, setShowHint]  = useState(false)
  const [showSol, setShowSol]    = useState(false)
  const [showWb, setShowWb]      = useState(false)

  const filtered = filter === 'ALL' ? questions : questions.filter(q => q.difficulty === filter)

  const openQ = (q) => { setSelected(q); setShowHint(false); setShowSol(false); setShowWb(false) }

  if (selected) {
    return (
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <button className="btn-console" onClick={() => setSelected(null)} style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
            ← QUESTIONS
          </button>
          <DiffBadge difficulty={selected.difficulty} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)', border: '1px solid rgba(0,212,255,0.2)', padding: '2px 8px', borderRadius: 4 }}>
            {selected.topic}
          </span>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
            {selected.title}
          </h2>
        </div>

        {/* DSA problem layout */}
        {type === 'dsa' && (
          <>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 16 }}>{selected.description}</p>
              {selected.examples.map((ex, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Example {i + 1}</div>
                  <div style={{ background: 'var(--bg-primary)', borderRadius: 4, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                    <div><span style={{ color: 'var(--accent-cyan)' }}>Input: </span><span style={{ color: 'var(--text-secondary)' }}>{ex.input}</span></div>
                    <div><span style={{ color: 'var(--accent-green)' }}>Output: </span><span style={{ color: 'var(--text-secondary)' }}>{ex.output}</span></div>
                    {ex.explanation && <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>{ex.explanation}</div>}
                  </div>
                </div>
              ))}
              {selected.constraints?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, letterSpacing: 1 }}>CONSTRAINTS</div>
                  <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.8 }}>
                    {selected.constraints.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Hints */}
            <div style={{ marginBottom: 12 }}>
              <button
                className="btn-console"
                onClick={() => setShowHint(h => !h)}
                style={{ padding: '6px 14px', fontSize: '0.78rem', borderColor: 'var(--accent-yellow)', color: 'var(--accent-yellow)' }}
              >
                {showHint ? '▼ HIDE HINTS' : '▶ SHOW HINTS'}
              </button>
              {showHint && (
                <div style={{ marginTop: 10, background: 'rgba(255,204,0,0.05)', border: '1px solid rgba(255,204,0,0.2)', borderRadius: 6, padding: '14px 18px' }}>
                  {selected.hints.map((h, i) => (
                    <div key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: i < selected.hints.length - 1 ? 8 : 0 }}>
                      <span style={{ color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)' }}>#{i + 1}</span> {h}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Solution */}
            <div>
              <button
                className="btn-console btn-console-success"
                onClick={() => setShowSol(s => !s)}
                style={{ padding: '6px 14px', fontSize: '0.78rem' }}
              >
                {showSol ? '▼ HIDE SOLUTION' : '▶ REVEAL SOLUTION'}
              </button>
              {showSol && (
                <div style={{ marginTop: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '20px 24px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 8 }}>APPROACH</div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>{selected.solution.approach}</p>
                  <div style={{ background: 'var(--bg-primary)', borderRadius: 6, padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-primary)', whiteSpace: 'pre', overflowX: 'auto', marginBottom: 14, lineHeight: 1.6, border: '1px solid var(--border-color)' }}>
                    {selected.solution.code}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    <span><span style={{ color: 'var(--text-muted)' }}>Time: </span><span style={{ color: 'var(--accent-cyan)' }}>{selected.solution.complexity.time}</span></span>
                    <span><span style={{ color: 'var(--text-muted)' }}>Space: </span><span style={{ color: 'var(--accent-cyan)' }}>{selected.solution.complexity.space}</span></span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Java Q&A layout */}
        {type === 'java' && (
          <>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', letterSpacing: 1, marginBottom: 10 }}>QUESTION</div>
              <p style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500, lineHeight: 1.6 }}>{selected.question}</p>
            </div>

            <button
              className="btn-console btn-console-success"
              onClick={() => setShowSol(s => !s)}
              style={{ padding: '6px 14px', fontSize: '0.78rem', marginBottom: 12 }}
            >
              {showSol ? '▼ HIDE ANSWER' : '▶ REVEAL ANSWER'}
            </button>

            {showSol && (
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '20px 24px' }}>
                {selected.answer.split('\n\n').map((para, i) => (
                  <p key={i} style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 12, whiteSpace: 'pre-wrap' }}>
                    {para}
                  </p>
                ))}
                {selected.keyPoints?.length > 0 && (
                  <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(0,255,102,0.05)', border: '1px solid rgba(0,255,102,0.2)', borderRadius: 6 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-green)', letterSpacing: 1, marginBottom: 8 }}>KEY POINTS</div>
                    <ul style={{ paddingLeft: 18, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.8 }}>
                      {selected.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
                {selected.codeExample && (
                  <div style={{ marginTop: 14, background: 'var(--bg-primary)', borderRadius: 6, padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-primary)', whiteSpace: 'pre', overflowX: 'auto', border: '1px solid var(--border-color)', lineHeight: 1.6 }}>
                    {selected.codeExample}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Interview Whiteboard ── */}
        <div style={{ marginTop: 28 }}>
          <button
            className="btn-console"
            onClick={() => setShowWb(w => !w)}
            style={{ padding: '6px 14px', fontSize: '0.78rem', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
          >
            {showWb ? '▼ CLOSE WHITEBOARD' : '▶ OPEN WHITEBOARD'}
          </button>
          {showWb && (
            <div style={{ marginTop: 14 }}>
              <InterviewWhiteboard
                questionId={selected.id}
                question={type === 'dsa' ? selected.description : selected.question}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Difficulty filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['ALL', 'Easy', 'Medium', 'Hard'].map(d => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            style={{
              background: filter === d ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
              color: filter === d ? 'var(--bg-primary)' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 4, padding: '5px 14px', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '0.78rem', letterSpacing: 0.5,
              transition: 'all 0.15s',
            }}
          >
            {d}
            <span style={{ marginLeft: 6, color: filter === d ? 'var(--bg-primary)' : 'var(--text-muted)', fontSize: '0.7rem' }}>
              {d === 'ALL' ? questions.length : questions.filter(q => q.difficulty === d).length}
            </span>
          </button>
        ))}
      </div>

      {/* Question list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => openQ(q)}
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              borderRadius: 8, padding: '14px 18px', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', width: 24, flexShrink: 0 }}>
              {String(idx + 1).padStart(2, '0')}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, fontSize: '0.95rem' }}>{q.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{q.topic}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {q.tags.slice(0, 2).map(t => <span key={t} className="tech-tag">{t}</span>)}
              <DiffBadge difficulty={q.difficulty} />
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: 4 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// TheoryPanel removed — replaced by StaticContentViewer component

// ─── Category View (Theory | Questions | Flashcards) ─────────────────────────
function CategoryView({ category, progress, onOpenChapter, onBack }) {
  const questions    = QUESTIONS_MAP[category.id] || []
  const chaptersInCat = CHAPTERS.filter(c => c.category === category.id)
  const hasQuestions = questions.length > 0
  const hasChapters  = chaptersInCat.length > 0
  const qType        = category.id === 'Java' ? 'java' : 'dsa'

  // Default tab priority: questions → flashcards → chapters
  const defaultTab = hasQuestions ? 'questions' : 'flashcards'
  const [activeTab, setActiveTab] = useState(defaultTab)

  const tabs = [
    hasQuestions        && { key: 'questions',  label: '💡 Questions', count: questions.length },
    true                && { key: 'flashcards', label: '📌 Flashcards' },
    hasChapters         && { key: 'chapters',   label: '◈ AI Chapters', count: chaptersInCat.length },
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
      {activeTab === 'questions' && (
        <QuestionsPanel questions={questions} type={qType} />
      )}

      {activeTab === 'flashcards' && (
        <FlashcardManager section={category.id.toLowerCase().replace(/\s+/g, '-')} />
      )}

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
    </div>
  )
}

// ─── Theory Subject View ──────────────────────────────────────────────────────
function TheorySubjectView({ subject, onBack }) {
  const subjectQuestions = QUESTIONS_MAP[subject.id] || []
  const [subTab, setSubTab] = useState('guides')
  const qType = subject.id === 'Java' ? 'java' : 'dsa'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <button className="btn-console" onClick={onBack} style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
          ← THEORY
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.4rem' }}>{subject.icon}</span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {subject.name}
          </h1>
        </div>
      </div>

      {subjectQuestions.length > 0 && (
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-color)', marginBottom: 24 }}>
          {[
            { key: 'guides',    label: '📚 Theory Guides' },
            { key: 'questions', label: '💡 Questions', count: subjectQuestions.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSubTab(tab.key)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 18px',
                fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: 0.5,
                color: subTab === tab.key ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                borderBottom: `2px solid ${subTab === tab.key ? 'var(--accent-cyan)' : 'transparent'}`,
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span style={{ fontSize: '0.68rem', color: subTab === tab.key ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {subTab === 'guides' && <StaticContentViewer categoryId={subject.id} />}
      {subTab === 'questions' && subjectQuestions.length > 0 && (
        <QuestionsPanel questions={subjectQuestions} type={qType} />
      )}
    </div>
  )
}

// ─── Theory View ──────────────────────────────────────────────────────────────
const THEORY_SUBJECTS = [
  { id: 'DSA',            name: 'Data Structures & Algorithms', icon: '󱃔', desc: '8 guides — trees, graphs, DP, patterns, bit manipulation' },
  { id: 'Java',           name: 'Java Deep Dive',               icon: '☕', desc: '8 guides — JVM, collections, concurrency, design patterns' },
  { id: 'CS Fundamentals',name: 'CS Fundamentals',              icon: '󰓙', desc: '8 guides — networks, OS, compilers, cryptography, distributed systems' },
  { id: 'Full Stack',     name: 'Frontend & Full Stack',        icon: '󰜎', desc: '8 guides — browser internals, React, performance, security' },
  { id: 'System Design',  name: 'System Design',                icon: '󱗿', desc: '9 guides — architecture, caching, databases, messaging, reliability' },
]

function TheoryView({ onOpenSubject }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>Theory Library</h1>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          Structured deep-dive guides for each subject — sidebar navigation, tabbed sections, worked examples.
        </p>
      </div>
      <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {THEORY_SUBJECTS.map(subj => {
          const items = HTML_SECTIONS[subj.id] || []
          return (
            <button
              key={subj.id}
              onClick={() => onOpenSubject(subj)}
              style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                borderRadius: 10, padding: '24px', cursor: 'pointer', textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: 14, transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.boxShadow = '0 0 16px var(--accent-cyan-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.6rem' }}>{subj.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.68rem', padding: '3px 8px',
                  borderRadius: 4, background: 'rgba(0,212,255,0.1)', color: 'var(--accent-cyan)',
                  border: '1px solid rgba(0,212,255,0.25)',
                }}>
                  {items.length} guides
                </span>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: 6 }}>
                  {subj.name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {subj.desc}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {items.slice(0, 4).map(item => (
                  <span
                    key={item.id}
                    style={{
                      fontSize: '0.68rem', padding: '2px 7px', borderRadius: 3,
                      background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {item.title}
                  </span>
                ))}
                {items.length > 4 && (
                  <span style={{ fontSize: '0.68rem', padding: '2px 7px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    +{items.length - 4} more
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Library View ─────────────────────────────────────────────────────────────
const QUESTION_CATS = CATEGORIES.filter(cat => (QUESTIONS_MAP[cat.id] || []).length > 0)
const TOTAL_QUESTIONS = Object.values(QUESTIONS_MAP).reduce((s, a) => s + a.length, 0)

function LibraryView({ progress, onOpenChapter }) {
  const [libTab, setLibTab] = useState('chapters') // 'chapters' | 'flashcards' | 'questions'

  // Chapters tab
  const [search, setSearch]   = useState('')
  const [sortBy, setSortBy]   = useState('default')
  const [activeCat, setActiveCat] = useState('ALL')

  // Hamburger topic drawer
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Flashcards tab
  const [flashCat, setFlashCat] = useState(CATEGORIES[0].id)

  // Questions tab
  const [qCat, setQCat] = useState(QUESTION_CATS[0]?.id || 'DSA')

  const filtered = CHAPTERS.filter(c => {
    const matchCat = activeCat === 'ALL' || c.category === activeCat
    const q = search.toLowerCase().trim()
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q))
    return matchCat && matchSearch
  }).sort((a, b) => {
    if (sortBy === 'quiz-asc')  return (progress[a.id]?.quizScore ?? Infinity)  - (progress[b.id]?.quizScore ?? Infinity)
    if (sortBy === 'quiz-desc') return (progress[b.id]?.quizScore ?? -Infinity) - (progress[a.id]?.quizScore ?? -Infinity)
    if (sortBy === 'recent') {
      const da = progress[a.id]?.quizDate || progress[a.id]?.readDate || ''
      const db = progress[b.id]?.quizDate || progress[b.id]?.readDate || ''
      return db > da ? 1 : -1
    }
    return 0
  })

  const LIB_TABS = [
    { key: 'chapters',   label: '◈ AI Chapters',  count: CHAPTERS.length },
    { key: 'flashcards', label: '📌 Flashcards' },
    { key: 'questions',  label: '💡 Questions', count: TOTAL_QUESTIONS },
  ]

  const pillStyle = (active) => ({
    background: active ? 'rgba(0,212,255,0.12)' : 'var(--bg-secondary)',
    border: `1px solid ${active ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
    color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
    borderRadius: 20, padding: '4px 14px', cursor: 'pointer',
    fontFamily: 'var(--font-mono)', fontSize: '0.73rem',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ position: 'relative' }}>

      {/* ── Topic Drawer (hamburger sidebar) ─────────────────────────────── */}
      {drawerOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}
          onClick={() => setDrawerOpen(false)}
        >
          {/* backdrop */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }} />
          {/* drawer panel */}
          <div
            className="topic-drawer"
            style={{
              position: 'relative', zIndex: 1,
              width: 280, height: '100%',
              background: 'var(--bg-secondary)',
              borderRight: '1px solid var(--border-color)',
              display: 'flex', flexDirection: 'column',
              boxShadow: '4px 0 32px rgba(0,0,0,0.4)',
              borderRadius: '0 20px 20px 0',
              overflow: 'hidden',
              animation: 'slideInLeft 0.22s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* drawer header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid var(--border-color)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-cyan)', letterSpacing: 1 }}>
                TOPICS
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1, padding: 4 }}
              >
                ✕
              </button>
            </div>

            {/* ALL option */}
            <button
              onClick={() => { setActiveCat('ALL'); setLibTab('chapters'); setDrawerOpen(false) }}
              style={{
                background: activeCat === 'ALL' ? 'rgba(0,212,255,0.08)' : 'none',
                border: 'none', borderLeft: activeCat === 'ALL' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                cursor: 'pointer', padding: '12px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                color: activeCat === 'ALL' ? 'var(--accent-cyan)' : 'var(--text-primary)',
                fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
                transition: 'all 0.15s', textAlign: 'left',
              }}
            >
              <span>All Topics</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{CHAPTERS.length}</span>
            </button>

            {/* category list */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {CATEGORIES.map(cat => {
                const n = CHAPTERS.filter(c => c.category === cat.id).length
                if (n === 0) return null
                const isActive = activeCat === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCat(cat.id); setLibTab('chapters'); setDrawerOpen(false) }}
                    style={{
                      width: '100%', background: isActive ? 'rgba(0,212,255,0.08)' : 'none',
                      border: 'none', borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                      cursor: 'pointer', padding: '12px 20px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      color: isActive ? 'var(--accent-cyan)' : 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
                      transition: 'all 0.15s', textAlign: 'left',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-primary)' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none' }}
                  >
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>{cat.icon}</span>
                    <span style={{ flex: 1, lineHeight: 1.3 }}>{cat.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>{n}</span>
                  </button>
                )
              })}
            </div>

            {/* progress bar at bottom */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span>Overall Progress</span>
                <span>{CHAPTERS.filter(c => progress[c.id]?.read).length} / {CHAPTERS.length}</span>
              </div>
              <div style={{ height: 4, background: 'var(--bg-primary)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2, background: 'var(--accent-cyan)',
                  width: `${Math.round((CHAPTERS.filter(c => progress[c.id]?.read).length / CHAPTERS.length) * 100)}%`,
                  transition: 'width 0.4s',
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Library tab bar + hamburger ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderBottom: '1px solid var(--border-color)', marginBottom: 28 }}>
        {/* Hamburger button */}
        <button
          onClick={() => setDrawerOpen(true)}
          title="Browse topics"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 4,
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', borderBottom: '2px solid transparent',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-cyan)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <span style={{ display: 'block', width: 18, height: 2, background: 'currentColor', borderRadius: 1 }} />
          <span style={{ display: 'block', width: 18, height: 2, background: 'currentColor', borderRadius: 1 }} />
          <span style={{ display: 'block', width: 18, height: 2, background: 'currentColor', borderRadius: 1 }} />
        </button>

        {/* divider */}
        <div style={{ width: 1, height: 24, background: 'var(--border-color)', marginRight: 4 }} />

        {LIB_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setLibTab(tab.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 20px',
              fontFamily: 'var(--font-mono)', fontSize: '0.82rem', letterSpacing: 0.5,
              color: libTab === tab.key ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${libTab === tab.key ? 'var(--accent-cyan)' : 'transparent'}`,
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: libTab === tab.key ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}

        {/* active topic badge */}
        {activeCat !== 'ALL' && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
              background: 'rgba(0,212,255,0.1)', border: '1px solid var(--accent-cyan)',
              color: 'var(--accent-cyan)', borderRadius: 12, padding: '2px 10px',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {CATEGORIES.find(c => c.id === activeCat)?.icon} {activeCat}
              <button
                onClick={() => setActiveCat('ALL')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)', padding: 0, lineHeight: 1, fontSize: '0.8rem' }}
              >✕</button>
            </span>
          </div>
        )}
      </div>

      {/* ── AI Chapters tab ── */}
      {libTab === 'chapters' && (
        <div>
          {/* Search + sort */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              className="search-bar"
              type="text"
              placeholder="🔍  Search chapters, tags, topics..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '8px 10px', cursor: 'pointer', outline: 'none', flexShrink: 0 }}
            >
              <option value="default">Default order</option>
              <option value="recent">Recently viewed</option>
              <option value="quiz-asc">Score: Low → High</option>
              <option value="quiz-desc">Score: High → Low</option>
            </select>
          </div>
          {/* Category filter pills */}
          <div className="pill-row" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
            <button style={pillStyle(activeCat === 'ALL')} onClick={() => setActiveCat('ALL')}>All ({CHAPTERS.length})</button>
            {CATEGORIES.map(cat => {
              const n = CHAPTERS.filter(c => c.category === cat.id).length
              return n > 0 && (
                <button key={cat.id} style={pillStyle(activeCat === cat.id)} onClick={() => setActiveCat(cat.id)}>
                  {cat.icon} {cat.name} ({n})
                </button>
              )
            })}
          </div>
          {/* Count + clear */}
          {(search || activeCat !== 'ALL') && (
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
              <button className="btn-console" onClick={() => { setSearch(''); setActiveCat('ALL') }} style={{ padding: '4px 12px', fontSize: '0.75rem' }}>
                ✕ Clear
              </button>
            </div>
          )}
          {/* Grid */}
          <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filtered.map(chapter => (
              <ChapterCard key={chapter.id} chapter={chapter} progress={progress} onClick={() => onOpenChapter(chapter)} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              No chapters match your search.
            </div>
          )}
        </div>
      )}

      {/* ── Flashcards tab ── */}
      {libTab === 'flashcards' && (
        <div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} style={pillStyle(flashCat === cat.id)} onClick={() => setFlashCat(cat.id)}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
          <FlashcardManager section={flashCat.toLowerCase().replace(/\s+/g, '-')} />
        </div>
      )}

      {/* ── Questions tab ── */}
      {libTab === 'questions' && (
        <div>
          {QUESTION_CATS.length > 1 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
              {QUESTION_CATS.map(cat => (
                <button key={cat.id} style={pillStyle(qCat === cat.id)} onClick={() => setQCat(cat.id)}>
                  {cat.icon} {cat.name}
                  <span style={{ marginLeft: 5, fontSize: '0.68rem', opacity: 0.7 }}>({(QUESTIONS_MAP[cat.id] || []).length})</span>
                </button>
              ))}
            </div>
          )}
          <QuestionsPanel
            questions={QUESTIONS_MAP[qCat] || []}
            type={qCat === 'Java' ? 'java' : 'dsa'}
          />
        </div>
      )}
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
      {/* Mobile drag handle */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border-color)' }} />
      </div>
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
    const isHtmlContent = content.trimStart().toLowerCase().startsWith('<!doctype') || content.trimStart().toLowerCase().startsWith('<html')
    const text = isHtmlContent
      ? (contentRef.current?.contentDocument?.body?.innerText || '')
      : (contentRef.current?.innerText || '')
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
  const isHtmlContent = !isLoading && !!content && (
    content.trimStart().toLowerCase().startsWith('<!doctype') ||
    content.trimStart().toLowerCase().startsWith('<html')
  )

  return (
    <>
      {/* Scroll progress bar */}
      <div style={{ position: 'fixed', top: 60, left: 0, right: 0, height: 3, zIndex: 99, background: 'var(--bg-tertiary)' }}>
        <div style={{ height: '100%', width: `${scrollPct}%`, background: 'var(--accent-cyan)', transition: 'width 0.1s', boxShadow: '0 0 8px var(--accent-cyan-glow)' }} />
      </div>

      {isHtmlContent ? (
        /* ── HTML mode: full-viewport sidebar+tabs layout ── */
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 66px)', overflow: 'hidden' }}>
          {/* Slim breadcrumb bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderBottom: '1px solid var(--border-color)', flexShrink: 0, flexWrap: 'wrap', background: 'var(--bg-primary)' }}>
            <button className="btn-console" onClick={onBack} style={{ padding: '4px 12px', fontSize: '0.78rem' }}>
              ← LIBRARY
            </button>
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {chapter.category} / {chapter.title}
            </span>
            {ttsSupported && (
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="tts-btn" onClick={ttsPlaying ? handleTtsPause : handleTtsPlay} title={ttsPlaying ? 'Pause' : 'Play'}>
                  {ttsPlaying ? '⏸' : '▶'}
                </button>
                <button className="tts-btn" onClick={handleTtsStop} title="Stop" disabled={!ttsPlaying}>⏹</button>
              </div>
            )}
            <button className="btn-console" onClick={() => setShowDocs(true)} style={{ padding: '4px 10px', fontSize: '0.76rem' }}>
              📄 DOCS
            </button>
            <button className="btn-console btn-console-success" onClick={onStartQuiz} style={{ padding: '4px 10px', fontSize: '0.76rem' }}>
              ▶ QUIZ
            </button>
          </div>
          {/* Full-height iframe — fills remaining viewport */}
          <iframe
            ref={contentRef}
            srcDoc={content}
            title={chapter.title}
            style={{ flex: 1, width: '100%', border: 'none', display: 'block' }}
          />
        </div>
      ) : (
        /* ── Markdown / loading mode ── */
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

          {/* Markdown content */}
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
      )}

    {/* Chatbot FAB */}
    {hasApiKey() && (
      <button className="chatbot-fab" onClick={() => setChatOpen(o => !o)} title="AI Coach">
        💬
      </button>
    )}

    {/* Chatbot backdrop (mobile only — tap outside to close) */}
    {hasApiKey() && chatOpen && (
      <div
        onClick={() => setChatOpen(false)}
        style={{
          display: 'none', // shown via CSS media query
          position: 'fixed', inset: 0, zIndex: 89,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)',
        }}
        className="chatbot-mobile-backdrop"
      />
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
            color: results[results.length-1]?.correct ? 'var(--accent-green)' : 'var(--accent-red)',
            marginBottom: 8, fontWeight: 700,
          }}>
            {results[results.length-1]?.correct ? '✓ CORRECT' : '✗ INCORRECT'}
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
// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen() {
  const [loading, setLoading] = useState(null) // 'google' | 'github' | null
  const [error, setError]     = useState(null)

  const handleGoogle = async () => {
    setLoading('google'); setError(null)
    const { error: err } = await signInWithGoogle()
    if (err) { setError(err.message); setLoading(null) }
  }

  const handleGitHub = async () => {
    setLoading('github'); setError(null)
    const { error: err } = await signInWithGitHub()
    if (err) { setError(err.message); setLoading(null) }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: 24,
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
        borderRadius: 16, padding: '52px 48px', maxWidth: 420, width: '100%', textAlign: 'center',
        boxShadow: '0 0 60px rgba(0,212,255,0.06)',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 12 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '2rem', letterSpacing: 4,
            color: 'var(--accent-cyan)', textShadow: '0 0 20px rgba(0,212,255,0.4)',
          }}>
            ENGINE<span style={{ color: 'var(--text-primary)' }}>X</span>
          </span>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: 36, letterSpacing: 1 }}>
          FAANG &amp; Big 4 Interview Prep Console
        </p>

        <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem', marginBottom: 28 }}>
          Sign in to continue
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={!!loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              padding: '13px 20px', borderRadius: 10, border: '1px solid var(--border-color)',
              background: loading === 'google' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.04)',
              color: 'var(--text-primary)', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem', fontWeight: 500, transition: 'all 0.2s',
              opacity: loading && loading !== 'google' ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          >
            {/* Google SVG */}
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#EA4335" d="M24 9.5c3.1 0 5.5 1.3 7.2 2.4l5.3-5.3C33.5 3.6 29.1 1.5 24 1.5 14.7 1.5 6.9 7.3 3.5 15.4l6.2 4.8C11.4 13.9 17.2 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 2.9-2.2 5.3-4.6 6.9l7.1 5.5C43.3 37.3 46.5 31.4 46.5 24.5z"/>
              <path fill="#FBBC05" d="M9.7 28.8A14.9 14.9 0 0 1 9.5 24c0-1.7.3-3.3.7-4.8l-6.2-4.8A23.5 23.5 0 0 0 1.5 24c0 3.8.9 7.4 2.5 10.6l5.7-5.8z"/>
              <path fill="#34A853" d="M24 46.5c5.2 0 9.5-1.7 12.7-4.6l-7.1-5.5c-1.8 1.2-4 1.9-5.6 1.9-6.8 0-12.6-4.5-14.3-10.7l-5.7 5.8C6.9 40.7 14.7 46.5 24 46.5z"/>
            </svg>
            {loading === 'google' ? 'Redirecting…' : 'Continue with Google'}
          </button>

          {/* GitHub */}
          <button
            onClick={handleGitHub}
            disabled={!!loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              padding: '13px 20px', borderRadius: 10, border: '1px solid var(--border-color)',
              background: loading === 'github' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.04)',
              color: 'var(--text-primary)', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem', fontWeight: 500, transition: 'all 0.2s',
              opacity: loading && loading !== 'github' ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          >
            {/* GitHub SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.08-.73.08-.73 1.2.09 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.42.36.81 1.1.81 2.22v3.29c0 .32.21.69.82.57A12 12 0 0 0 12 .3"/>
            </svg>
            {loading === 'github' ? 'Redirecting…' : 'Continue with GitHub'}
          </button>
        </div>

        {error && (
          <p style={{ marginTop: 20, color: 'var(--accent-red, #ff4444)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
            ⚠ {error}
          </p>
        )}

        <p style={{ marginTop: 32, color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: 1.6 }}>
          By signing in you agree to use this app for personal interview preparation only.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState('library')   // 'library' | 'category' | 'chapter' | 'quiz' | 'dashboard' | 'theory' | 'theory-subject'
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedTheoryCategory, setSelectedTheoryCategory] = useState(null)
  // selectedHtmlItem removed — theory is now inline via StaticContentViewer
  const [progress, setProgress] = useState(loadProgress)
  const [showSettings, setShowSettings] = useState(false)
  const [apiConfigured, setApiConfigured] = useState(hasApiKey)
  const [providerLabel, setProviderLabel] = useState(() => getProvider().toUpperCase())
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(THEME_KEY) !== 'light')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(undefined)
  const [authLoading, setAuthLoading] = useState(true)

  // ── Supabase auth ─────────────────────────────────────────────────────────
  useEffect(() => {
    // Failsafe: never leave app stuck on INITIALIZING for >4s
    const timeout = setTimeout(() => setAuthLoading(false), 4000)

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setAuthLoading(false)
        clearTimeout(timeout)
      })
      .catch(() => {
        setUser(null)
        setAuthLoading(false)
        clearTimeout(timeout)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
      clearTimeout(timeout)
    })

    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

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

  const handleOpenCategory = (cat) => {
    setSelectedCategory(cat)
    setView('category')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenTheory = (cat) => {
    const subj = THEORY_SUBJECTS.find(s => s.id === cat.id) || { id: cat.id, name: cat.name, icon: cat.icon }
    setSelectedTheoryCategory(subj)
    setView('theory-subject')
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

  // Auth loading splash
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontSize: '0.85rem', letterSpacing: 2, opacity: 0.7 }}>
          INITIALIZING…
        </span>
      </div>
    )
  }

  // Not authenticated → login screen
  if (!user) return <LoginScreen />

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
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>

          {/* Logo */}
          <button
            onClick={() => { setView('library'); setMobileMenuOpen(false) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: 0, flexShrink: 0 }}
          >
            <span style={{
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.2rem',
              color: 'var(--accent-cyan)', letterSpacing: 2,
              textShadow: '0 0 12px rgba(0,212,255,0.4)',
            }}>
              ENGINE<span style={{ color: 'var(--text-primary)' }}>X</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="header-nav" style={{ display: 'flex', gap: 4 }}>
            {[
              { label: 'Library', val: 'library' },
              { label: 'Theory',  val: 'theory' },
              { label: 'Dashboard', val: 'dashboard' },
            ].map(({ label, val }) => {
              const isActive =
                view === val ||
                (val === 'library' && ['category','html','chapter','quiz'].includes(view)) ||
                (val === 'theory'  && view === 'theory-subject')
              return (
                <button
                  key={val}
                  onClick={() => setView(val)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '6px 14px', borderRadius: 4,
                    fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: 0.5,
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    borderBottom: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </nav>

          {/* Desktop right actions */}
          <div className="header-actions-desktop" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
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
            <button className="theme-toggle" onClick={() => setDarkMode(d => !d)} title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              {darkMode ? '☀' : '🌙'}
            </button>
            {/* Settings */}
            <button className="btn-console" onClick={() => setShowSettings(true)} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
              ⚙ SETTINGS
            </button>
            {/* User avatar + logout */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" referrerPolicy="no-referrer"
                    style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border-color)', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border-color)',
                    background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.75rem', color: '#000',
                  }}>
                    {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
                  </div>
                )}
                <button onClick={() => signOut()} style={{
                  background: 'none', border: '1px solid var(--border-color)', borderRadius: 6,
                  color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 10px',
                  fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                }}>Sign out</button>
              </div>
            )}
          </div>

          {/* Mobile right: theme + hamburger */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="theme-toggle" style={{ display: 'none' /* shown via .header-actions-mobile CSS */ }}
              onClick={() => setDarkMode(d => !d)}>{darkMode ? '☀' : '🌙'}</button>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(m => !m)}
              aria-label="Open menu"
            >
              <span style={{ display: 'block', width: 18, height: 2, background: mobileMenuOpen ? 'var(--accent-cyan)' : 'currentColor', borderRadius: 1, transform: mobileMenuOpen ? 'rotate(45deg) translate(4px,4px)' : 'none', transition: 'transform 0.2s' }} />
              <span style={{ display: 'block', width: 18, height: 2, background: 'currentColor', borderRadius: 1, opacity: mobileMenuOpen ? 0 : 1, transition: 'opacity 0.15s' }} />
              <span style={{ display: 'block', width: 18, height: 2, background: mobileMenuOpen ? 'var(--accent-cyan)' : 'currentColor', borderRadius: 1, transform: mobileMenuOpen ? 'rotate(-45deg) translate(4px,-4px)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          </div>

          {/* Mobile nav dropdown */}
          <div className={`mobile-nav-panel ${mobileMenuOpen ? 'open' : ''}`}>
            {[
              { label: '◈ Library', val: 'library' },
              { label: '📚 Theory',  val: 'theory' },
              { label: '📊 Dashboard', val: 'dashboard' },
            ].map(({ label, val }) => {
              const isActive = view === val ||
                (val === 'library' && ['category','html','chapter','quiz'].includes(view)) ||
                (val === 'theory'  && view === 'theory-subject')
              return (
                <button
                  key={val}
                  className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
                  onClick={() => { setView(val); setMobileMenuOpen(false) }}
                >
                  {label}
                </button>
              )
            })}
            <div className="mobile-nav-divider" />
            <div style={{ display: 'flex', gap: 8, padding: '4px 0', flexWrap: 'wrap' }}>
              <button className="theme-toggle" onClick={() => setDarkMode(d => !d)}>{darkMode ? '☀ Light' : '🌙 Dark'}</button>
              <button className="btn-console" onClick={() => { setShowSettings(true); setMobileMenuOpen(false) }} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                ⚙ Settings
              </button>
              {user && (
                <button onClick={() => signOut()} style={{
                  background: 'none', border: '1px solid var(--border-color)', borderRadius: 6,
                  color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px 14px',
                  fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                }}>Sign out</button>
              )}
            </div>
            {/* API status in mobile menu */}
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: 1,
              padding: '3px 10px', borderRadius: 4, border: '1px solid', display: 'inline-flex', alignSelf: 'flex-start',
              borderColor: apiConfigured ? 'rgba(0,255,102,0.3)' : 'rgba(255,204,0,0.3)',
              color: apiConfigured ? 'var(--accent-green)' : 'var(--accent-yellow)',
              background: apiConfigured ? 'rgba(0,255,102,0.05)' : 'rgba(255,204,0,0.05)',
            }}>
              {apiConfigured ? `● LIVE · ${providerLabel}` : '● DEMO MODE'}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main-content" style={{ flex: 1, maxWidth: 1400, width: '100%', margin: '0 auto', padding: '32px 28px' }}>
        {view === 'library' && (
          <LibraryView progress={progress} onOpenChapter={handleOpenChapter} />
        )}
        {view === 'theory' && (
          <TheoryView
            onOpenSubject={(subj) => {
              setSelectedTheoryCategory(subj)
              setView('theory-subject')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}
        {view === 'theory-subject' && selectedTheoryCategory && (
          <TheorySubjectView
            subject={selectedTheoryCategory}
            onBack={() => setView('theory')}
          />
        )}
        {view === 'category' && selectedCategory && (
          <CategoryView
            category={selectedCategory}
            progress={progress}
            onOpenChapter={handleOpenChapter}
            onBack={() => setView('library')}
          />
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
