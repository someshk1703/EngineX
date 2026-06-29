# EngineX

A FAANG & Big 4 interview preparation console — structured learning, AI-generated content, quizzes, progress tracking, and an AI coaching chatbot, all in a single-page React app.

---

## Features

- **Chapter Library** — Browse 100+ chapters across 8 categories: DSA, System Design, Full Stack, JavaScript, Java, CS Fundamentals, Behavioral, and more.
- **AI-Powered Content** — Generate deep-dive chapter explanations on demand using your own API key (Anthropic Claude, GitHub Models, Google Gemini, or OpenAI). Falls back to rich pre-written content when no key is set.
- **Interactive Quizzes** — MCQ quizzes per chapter with explanations and spaced-repetition review tracking.
- **AI Coaching Chatbot** — Ask follow-up questions in context of the chapter you are reading.
- **Progress Dashboard** — Readiness score, daily streak, 84-day activity heatmap, category breakdown, and a due-for-review queue.
- **Official Docs** — One-click access to the authoritative documentation for each chapter topic.
- **Notes** — Per-chapter freeform notes saved locally.
- **Dark / Light Theme** — Toggled in-app, persisted to localStorage.
- **PWA** — Installable with a service worker and web app manifest.
- **Auth** — Google and GitHub OAuth via Supabase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 (functional components + hooks) |
| Build Tool | Vite 4 |
| Auth | Supabase (Google OAuth, GitHub OAuth) |
| AI Providers | Anthropic Claude, GitHub Models, Google Gemini, OpenAI |
| Persistence | `localStorage` |
| Styling | CSS custom properties (no Tailwind, no CSS-in-JS) |
| PWA | `public/manifest.json` + `public/sw.js` |

---

## Project Structure

```
EngineX/
├── index.html                    # Vite entry point
├── vite.config.js                # Vite config (port 5173)
├── package.json
├── public/
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker
├── src/
│   ├── main.jsx                  # React DOM root
│   ├── App.jsx                   # Root component — all views + state machine routing
│   ├── App.css / index.css       # Global styles and CSS custom properties
│   ├── data/
│   │   ├── topics.js             # CATEGORIES + ALL_CHAPTERS (metadata + fallback content)
│   │   └── docsMap.js            # Chapter title → official docs URL mapping
│   └── services/
│       ├── claudeService.js      # Multi-provider AI abstraction
│       └── supabaseClient.js     # Supabase auth client
├── html/                         # Pre-written static HTML reference content
│   ├── csfundamendals/           # CS Fundamentals (networks, OS, DBs, compilers, crypto, distributed systems)
│   ├── dsa/                      # DSA deep-dives (nonlinear, graphs, DP, greedy, bitmanip, master ref)
│   ├── java/                     # Java (OOP, collections, concurrency, design patterns, JVM, SOLID)
│   ├── js/                       # JavaScript (browser internals, React, performance, security, state)
│   └── systemdesignhtml/         # System Design guides (caching, DBs, distributed, networking, messaging)
├── docs/
│   └── app-architecture.md       # Authoritative architecture reference
└── specs/                        # Feature specifications
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone <repo-url>
cd EngineX
npm install
```

### Environment Variables

Create a `.env` file at the project root for Supabase auth:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Auth is required to use the app. Without these vars, the login screen will not function.

### Development

```bash
npm run dev
```

App runs at `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview   # serve the built output locally
```

---

## AI Setup

API keys are entered in-app via the **Settings** panel (gear icon). Keys are stored in `localStorage` — never sent to any server other than the provider's own API.

| Provider | Key stored in |
|---|---|
| Anthropic | `enginex_anthropic_key` |
| GitHub Models | `enginex_github_pat` |
| Google Gemini | `enginex_gemini_key` |
| OpenAI | `enginex_openai_key` |

If no key is configured, every chapter falls back to rich pre-written content and quizzes — no API key is required to use the app.

---

## Navigation

There is no React Router. Navigation is a state machine on a single `view` string:

| View | Description |
|---|---|
| `library` | Chapter grid with category sidebar and search |
| `chapter` | AI or fallback content reader, notes, chatbot |
| `quiz` | MCQ quiz for the selected chapter |
| `dashboard` | Progress stats, heatmap, streak, review queue |

---

## localStorage Keys

| Key | Purpose |
|---|---|
| `enginex_progress` | Per-chapter read/quiz state |
| `enginex_notes` | Per-chapter freeform notes |
| `enginex_streak` | `{ count, lastDate }` daily streak |
| `enginex_theme` | `"dark"` or `"light"` |
| `enginex_provider` | Active AI provider |
| `enginex_model` | Selected model ID or `"auto"` |
| `enginex_ref_urls` | Extra user-added reference URLs |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint (zero warnings threshold) |

---

## Architecture

See [docs/app-architecture.md](docs/app-architecture.md) for the full architecture reference including component tree, data model, service API, auth flow, and styling system.
