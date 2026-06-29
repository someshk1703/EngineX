// ─── API Endpoints ────────────────────────────────────────────────────────────
const ANTHROPIC_API_URL     = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION     = "2023-06-01";
const GITHUB_MODELS_API_URL = "https://models.inference.ai.azure.com/chat/completions";
const GEMINI_API_BASE       = "https://generativelanguage.googleapis.com/v1beta/models";
const OPENAI_API_URL        = "https://api.openai.com/v1/chat/completions";

// ─── Storage keys ─────────────────────────────────────────────────────────────
const KEY_ANTHROPIC   = "enginex_anthropic_key";
const KEY_GITHUB_PAT  = "enginex_github_pat";
const KEY_GEMINI      = "enginex_gemini_key";
const KEY_OPENAI      = "enginex_openai_key";
const KEY_PROVIDER    = "enginex_provider";       // "anthropic" | "github" | "gemini" | "openai"
const KEY_MODEL       = "enginex_model";
const KEY_REF_URLS    = "enginex_ref_urls";       // JSON array of URL strings

// ─── Defaults ─────────────────────────────────────────────────────────────────
// AUTO resolves to the best default for each provider at runtime.
// Users who don't want to pick a specific model should leave this selected.
const AUTO_MODEL_DEFAULTS = {
  anthropic: "claude-sonnet-4-20250514",
  github:    "gpt-5-mini-2025-08-07",
  gemini:    "gemini-2.5-flash",
  openai:    "gpt-4o",
};

export const ANTHROPIC_MODELS = [
  { id: "auto",                        label: "⚡ AUTO — Best for your subscription" },
  { id: "claude-sonnet-4-20250514",    label: "Claude Sonnet 4 (latest)" },
  { id: "claude-3-7-sonnet-20250219",  label: "Claude 3.7 Sonnet" },
  { id: "claude-3-5-sonnet-20241022",  label: "Claude 3.5 Sonnet" },
];

export const GITHUB_MODELS = [
  { id: "auto",                        label: "⚡ AUTO — Best for your subscription" },
  { id: "gpt-5-mini-2025-08-07",       label: "GPT-5 mini" },
  { id: "gpt-5.4-mini",                label: "GPT-5.4 mini" },
  { id: "gemini-3-flash-preview",      label: "Gemini 3 Flash Preview" },
  { id: "claude-haiku-4-5-20251001",   label: "Claude Haiku 4.5" },
];

// Free-tier models — no credit card required for Gemini API
export const GEMINI_MODELS = [
  { id: "auto",                        label: "⚡ AUTO — Best for your subscription" },
  { id: "gemini-2.5-flash",            label: "Gemini 2.5 Flash (free tier)" },
  { id: "gemini-2.5-pro",              label: "Gemini 2.5 Pro (free tier limited)" },
  { id: "gemini-2.0-flash",            label: "Gemini 2.0 Flash (free tier)" },
];

export const OPENAI_MODELS = [
  { id: "auto",                        label: "⚡ AUTO — Best for your subscription" },
  { id: "gpt-4o-mini",                 label: "GPT-4o mini (cheapest)" },
  { id: "gpt-4o",                      label: "GPT-4o" },
  { id: "gpt-4.1",                     label: "GPT-4.1" },
  { id: "o4-mini",                     label: "o4 mini (reasoning)" },
];

// ─── Provider helpers ─────────────────────────────────────────────────────────
export function getProvider() {
  return localStorage.getItem(KEY_PROVIDER) || "anthropic";
}
export function setProvider(p) {
  localStorage.setItem(KEY_PROVIDER, p);
}

// ─── Anthropic helpers ────────────────────────────────────────────────────────
export function hasApiKey() {
  const provider = getProvider();
  if (provider === "github")  return hasGitHubPat();
  if (provider === "gemini")  return hasGeminiKey();
  if (provider === "openai")  return hasOpenAiKey();
  const key = localStorage.getItem(KEY_ANTHROPIC);
  return !!key && key.trim().length > 0;
}
export function getApiKey() {
  return localStorage.getItem(KEY_ANTHROPIC) || "";
}
export function setApiKey(key) {
  localStorage.setItem(KEY_ANTHROPIC, key);
}

// ─── Gemini key helpers ──────────────────────────────────────────────────────
export function hasGeminiKey() {
  const k = localStorage.getItem(KEY_GEMINI);
  return !!k && k.trim().length > 0;
}
export function getGeminiKey() {
  return localStorage.getItem(KEY_GEMINI) || "";
}
export function setGeminiKey(key) {
  localStorage.setItem(KEY_GEMINI, key);
}

// ─── OpenAI key helpers ───────────────────────────────────────────────────────
export function hasOpenAiKey() {
  const k = localStorage.getItem(KEY_OPENAI);
  return !!k && k.trim().length > 0;
}
export function getOpenAiKey() {
  return localStorage.getItem(KEY_OPENAI) || "";
}
export function setOpenAiKey(key) {
  localStorage.setItem(KEY_OPENAI, key);
}

// ─── GitHub PAT helpers ───────────────────────────────────────────────────────
export function hasGitHubPat() {
  const t = localStorage.getItem(KEY_GITHUB_PAT);
  return !!t && t.trim().length > 0;
}
export function getGitHubPat() {
  return localStorage.getItem(KEY_GITHUB_PAT) || "";
}
export function setGitHubPat(token) {
  localStorage.setItem(KEY_GITHUB_PAT, token);
}

// ─── Model helpers ────────────────────────────────────────────────────────────
export function getSelectedModel() {
  return localStorage.getItem(KEY_MODEL) || "auto";
}
export function setSelectedModel(m) {
  localStorage.setItem(KEY_MODEL, m);
}

// Resolves "auto" to the concrete model string for the current provider.
export function resolveModel(provider, modelId) {
  return modelId === "auto" ? (AUTO_MODEL_DEFAULTS[provider] ?? modelId) : modelId;
}

// ─── Reference URL helpers ────────────────────────────────────────────────────
export function getReferenceUrls() {
  try { return JSON.parse(localStorage.getItem(KEY_REF_URLS)) || []; }
  catch { return []; }
}
export function setReferenceUrls(urls) {
  localStorage.setItem(KEY_REF_URLS, JSON.stringify(urls));
}

// ─── Curated official documentation per category ──────────────────────────────
// These are automatically injected into prompts based on the chapter's category.
// Users never have to add these manually — they are always active.
export const REFERENCE_DOCS = {
  "DSA": [
    { label: "NeetCode (Patterns & Roadmap)",    url: "https://neetcode.io" },
    { label: "LeetCode",                          url: "https://leetcode.com" },
    { label: "Big O Cheatsheet",                  url: "https://bigocheatsheet.com" },
    { label: "CS50 Harvard (CS Fundamentals)",    url: "https://cs50.harvard.edu/x" },
  ],
  "System Design": [
    { label: "ByteByteGo",                        url: "https://bytebytego.com" },
    { label: "AWS Architecture Center",           url: "https://aws.amazon.com/architecture" },
    { label: "Google Cloud Architecture",         url: "https://cloud.google.com/architecture" },
    { label: "Microsoft Azure Architecture",      url: "https://learn.microsoft.com/en-us/azure/architecture" },
    { label: "Martin Fowler — Microservices",     url: "https://martinfowler.com/microservices" },
    { label: "Apache Kafka",                      url: "https://kafka.apache.org/documentation" },
    { label: "Redis",                             url: "https://redis.io/docs" },
  ],
  "Full Stack": [
    { label: "React Official",                    url: "https://react.dev" },
    { label: "TypeScript Official",               url: "https://www.typescriptlang.org/docs" },
    { label: "Next.js Official",                  url: "https://nextjs.org/docs" },
    { label: "Node.js Official",                  url: "https://nodejs.org/en/docs" },
    { label: "Express.js Official",               url: "https://expressjs.com" },
    { label: "GraphQL Official",                  url: "https://graphql.org/learn" },
    { label: "Jest Official",                     url: "https://jestjs.io/docs/getting-started" },
    { label: "React Testing Library",             url: "https://testing-library.com/docs/react-testing-library/intro" },
    { label: "Core Web Vitals (web.dev)",         url: "https://web.dev/explore/learn-core-web-vitals" },
    { label: "RabbitMQ Official",                 url: "https://www.rabbitmq.com/documentation.html" },
  ],
  "Cloud & DevOps": [
    { label: "AWS Full Documentation",            url: "https://docs.aws.amazon.com" },
    { label: "AWS EC2",                           url: "https://docs.aws.amazon.com/ec2" },
    { label: "AWS S3",                            url: "https://docs.aws.amazon.com/s3" },
    { label: "AWS Lambda",                        url: "https://docs.aws.amazon.com/lambda" },
    { label: "AWS RDS",                           url: "https://docs.aws.amazon.com/rds" },
    { label: "AWS API Gateway",                   url: "https://docs.aws.amazon.com/apigateway" },
    { label: "AWS IAM",                           url: "https://docs.aws.amazon.com/iam" },
    { label: "AWS CloudFront",                    url: "https://docs.aws.amazon.com/cloudfront" },
    { label: "AWS VPC",                           url: "https://docs.aws.amazon.com/vpc" },
    { label: "Docker Official",                   url: "https://docs.docker.com" },
    { label: "Kubernetes Official",               url: "https://kubernetes.io/docs" },
    { label: "Terraform Official",                url: "https://developer.hashicorp.com/terraform/docs" },
    { label: "GitHub Actions",                    url: "https://docs.github.com/en/actions" },
    { label: "Nginx Official",                    url: "https://nginx.org/en/docs" },
    { label: "Prometheus Official",               url: "https://prometheus.io/docs" },
    { label: "Grafana Official",                  url: "https://grafana.com/docs" },
  ],
  "Databases": [
    { label: "PostgreSQL Official",               url: "https://www.postgresql.org/docs" },
    { label: "MongoDB Official",                  url: "https://www.mongodb.com/docs" },
    { label: "Redis Official",                    url: "https://redis.io/docs" },
    { label: "Prisma ORM Official",               url: "https://www.prisma.io/docs" },
    { label: "Apache Kafka",                      url: "https://kafka.apache.org/documentation" },
  ],
  "Security": [
    { label: "OWASP Top 10",                      url: "https://owasp.org/www-project-top-ten" },
    { label: "OWASP Cheat Sheet Series",          url: "https://cheatsheetseries.owasp.org" },
    { label: "Mozilla Web Security (MDN)",        url: "https://developer.mozilla.org/en-US/docs/Web/Security" },
    { label: "JWT Introduction",                  url: "https://jwt.io/introduction" },
    { label: "OAuth 2.0 Official",                url: "https://oauth.net/2" },
    { label: "OpenID Connect",                    url: "https://openid.net/developers/how-connect-works" },
  ],
  "CS Fundamentals": [
    { label: "CS50 Harvard",                      url: "https://cs50.harvard.edu/x" },
    { label: "MDN Web Docs",                      url: "https://developer.mozilla.org" },
    { label: "Big O Cheatsheet",                  url: "https://bigocheatsheet.com" },
  ],
  "Soft Skills": [
    { label: "Martin Fowler — Engineering Practices", url: "https://martinfowler.com" },
  ],
};

// ─── Internal: build reference context string ─────────────────────────────────
// Merges curated docs for the chapter's category + any user-added custom URLs.
function buildRefContext(chapter) {
  const curated = chapter ? (REFERENCE_DOCS[chapter.category] || []) : [];
  const custom  = getReferenceUrls().map(url => ({ label: url, url }));
  const all     = [...curated, ...custom];
  if (!all.length) return "";

  const lines = all.map(({ label, url }) => `- ${label}: ${url}`).join("\n");
  return `\n\nReference Documentation — align explanations, terminology, and code examples with the official standards defined at these sources:\n${lines}`;
}

// ─── Internal: Gemini (Google AI) call ──────────────────────────────────────
async function callGemini(model, systemPrompt, userMessage, maxTokens = 3500) {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error("No Gemini API Key configured. Add your key in Settings.");

  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: { maxOutputTokens: maxTokens },
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg = errData?.error?.message || `Gemini HTTP ${response.status}: ${response.statusText}`;
    throw new Error(msg);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// ─── Internal: OpenAI call ────────────────────────────────────────────────────
async function callOpenAI(model, systemPrompt, userMessage, maxTokens = 3500) {
  const apiKey = getOpenAiKey();
  if (!apiKey) throw new Error("No OpenAI API Key configured. Add your key in Settings.");

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage  },
      ],
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      errData?.error?.message || `OpenAI HTTP ${response.status}: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ─── Internal: GitHub Models (OpenAI-compatible) call ─────────────────────────
async function callGitHubModels(model, systemPrompt, userMessage) {
  const token = getGitHubPat();
  if (!token) throw new Error("No GitHub PAT configured. Add your token in Settings.");

  const response = await fetch(GITHUB_MODELS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage  },
      ],
      max_tokens: 3500,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      errData?.error?.message || `GitHub Models HTTP ${response.status}: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ─── Internal: Anthropic call ─────────────────────────────────────────────────
async function callAnthropic(model, systemPrompt, userMessage, maxTokens = 3500) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("No Anthropic API Key found. Add your key in Settings.");

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Anthropic HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// ─── Internal: unified dispatch ───────────────────────────────────────────────
async function callAI(systemPrompt, userMessage, maxTokens = 3500) {
  const provider = getProvider();
  const model    = resolveModel(provider, getSelectedModel());
  switch (provider) {
    case "github":  return callGitHubModels(model, systemPrompt, userMessage);
    case "gemini":  return callGemini(model, systemPrompt, userMessage, maxTokens);
    case "openai":  return callOpenAI(model, systemPrompt, userMessage, maxTokens);
    default:        return callAnthropic(model, systemPrompt, userMessage, maxTokens);
  }
}

// ─── Generate Chapter Content ─────────────────────────────────────────────────

// Universal tab set — same order for every category so content is predictable
const UNIVERSAL_TABS = ['Definition','How It Works','Complexity','Variants','Patterns','Smell→Pattern','Real-World','Code','Worked Example','Practice','Interview'];
const CATEGORY_TABS = {}; // kept for future per-category overrides

export async function generateChapterContent(chapter) {
  const refContext = buildRefContext(chapter);

  const tabs = CATEGORY_TABS[chapter.category] || UNIVERSAL_TABS;
  const tabsJson = JSON.stringify(tabs);

  const systemPrompt = `You are a world-class software engineering educator and FAANG interview coach. Generate content for Full Stack engineers preparing for top-tier tech interviews.

━━ OUTPUT FORMAT ━━
Respond with a SINGLE complete self-contained HTML file. No prose, no markdown, no explanation before or after. The response MUST start with <!DOCTYPE html> and end with </html>.

Use this EXACT skeleton:

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>TOPIC</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;font-family:'Segoe UI',system-ui,sans-serif;background:#fbf9e1;color:#2d2a1e;font-size:14px;line-height:1.7}
.app{display:flex;height:100vh;overflow:hidden}
.sidebar{width:220px;min-width:180px;overflow-y:auto;background:#f2eec8;border-right:1px solid #c8be8a;padding:16px 0}
.sidebar-title{font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#8c8060;padding:0 16px 10px}
.topic-btn{display:flex;align-items:center;gap:8px;width:100%;padding:8px 16px;background:none;border:none;cursor:pointer;font-size:.82rem;color:#5a5340;text-align:left;transition:background .15s}
.topic-btn:hover{background:rgba(0,0,0,.06)}
.topic-btn.active{background:#ede7fb;color:#5b3fa6;font-weight:600}
.topic-num{font-size:.7rem;color:#8c8060;min-width:20px}
.main{flex:1;overflow-y:auto}
.section-tabs{display:flex;flex-wrap:wrap;gap:6px;padding:16px 24px 12px;border-bottom:1px solid #e8e2b8;position:sticky;top:0;background:#fbf9e1;z-index:10}
.tab{padding:5px 12px;border-radius:20px;font-size:.75rem;font-weight:600;cursor:pointer;border:1.5px solid #d9d09a;background:none;color:#5a5340;transition:all .15s}
.tab:hover{border-color:#9b79e0;color:#5b3fa6}
.tab.active{background:#ede7fb;border-color:#9b79e0;color:#5b3fa6}
.content{padding:24px;max-width:860px}
.topic-header{margin-bottom:24px}
.topic-title{font-size:1.4rem;font-weight:700;color:#2d2a1e}
.topic-subtitle{font-size:.9rem;color:#5a5340;margin-top:4px}
.card{background:rgba(255,255,255,.6);border:1px solid #d9d09a;border-radius:8px;padding:16px;margin-bottom:14px}
.card-label{font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#5b3fa6;margin-bottom:6px}
.card-text{font-size:.88rem;color:#5a5340}
.highlight{background:#ede7fb;border-left:3px solid #9b79e0;padding:12px 16px;border-radius:0 6px 6px 0;margin-bottom:14px;font-size:.88rem}
.code-block{background:#eeebd0;border:1px solid #d9d09a;border-radius:6px;padding:14px 16px;font-family:'JetBrains Mono','Fira Code',monospace;font-size:.82rem;overflow-x:auto;margin-bottom:14px;white-space:pre}
.complexity-table{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:.82rem}
.complexity-table th{background:#f2eec8;padding:8px 12px;text-align:left;border-bottom:2px solid #c8be8a}
.complexity-table td{padding:6px 12px;border-bottom:1px solid #e8e2b8}
.o-good{color:#15803d;font-weight:700}
.o-mid{color:#b45309;font-weight:700}
.o-bad{color:#b91c1c;font-weight:700}
.pattern-card{border:1px solid #d9d09a;border-radius:8px;padding:14px;margin-bottom:12px}
.pattern-name{font-weight:700;font-size:.9rem;margin-bottom:4px}
.trigger{font-size:.8rem;color:#5a5340;margin-bottom:6px}
.pattern-when{font-size:.82rem}
.smell-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px}
.smell-if,.smell-then,.smell-why{background:rgba(255,255,255,.5);border:1px solid #e8e2b8;border-radius:6px;padding:10px 12px;font-size:.82rem}
.smell-if::before{content:"IF";display:block;font-size:.65rem;font-weight:700;letter-spacing:.1em;color:#5b3fa6;margin-bottom:4px}
.smell-then::before{content:"THEN";display:block;font-size:.65rem;font-weight:700;letter-spacing:.1em;color:#15803d;margin-bottom:4px}
.smell-why::before{content:"WHY";display:block;font-size:.65rem;font-weight:700;letter-spacing:.1em;color:#b45309;margin-bottom:4px}
.problem-card{border:1px solid #d9d09a;border-radius:8px;padding:12px 14px;margin-bottom:10px;display:flex;gap:12px;align-items:flex-start}
.problem-diff{font-size:.7rem;font-weight:700;padding:2px 8px;border-radius:10px;white-space:nowrap;margin-top:2px}
.easy{background:#dcfce7;color:#15803d}
.medium{background:#fef9c3;color:#b45309}
.hard{background:#fee2e2;color:#b91c1c}
.problem-name{font-weight:600;font-size:.88rem}
.problem-meta{font-size:.78rem;color:#8c8060;margin-top:2px}
.interview-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid #d9d09a;border-radius:20px;padding:6px 14px;margin:4px;font-size:.8rem}
.pill-dot{width:6px;height:6px;border-radius:50%;background:#9b79e0}
h2{font-size:1rem;font-weight:700;color:#2d2a1e;margin:18px 0 10px}
h3{font-size:.9rem;font-weight:600;color:#5b3fa6;margin:14px 0 8px}
p{margin-bottom:10px;font-size:.88rem}
ul,ol{padding-left:20px;margin-bottom:10px;font-size:.88rem}
li{margin-bottom:4px}
strong{font-weight:700}
</style>
</head>
<body>
<div class="app">
  <div class="sidebar">
    <div class="sidebar-title">Topics</div>
    <div id="topic-list"></div>
  </div>
  <div class="main">
    <div id="tab-bar" class="section-tabs"></div>
    <div class="content" id="content-area"></div>
  </div>
</div>
<script>
const TABS = /* INSERT TABS ARRAY */;
const DATA = [/* INSERT DATA ARRAY */];

let currentTopic = 0, currentTab = 0;

function renderTabs() {
  document.getElementById('tab-bar').innerHTML = TABS.map(function(t,i){
    return '<button class="tab'+(i===currentTab?' active':'')+'" onclick="selectSection('+i+')">'+t+'</button>';
  }).join('');
}
function renderContent() {
  var topic = DATA[currentTopic];
  document.getElementById('content-area').innerHTML =
    '<div class="topic-header"><div class="topic-title">'+topic.title+'</div><div class="topic-subtitle">'+topic.subtitle+'</div></div>'+
    '<div class="section">'+(topic.sections[currentTab]||'')+'</div>';
}
function selectTopic(i) {
  currentTopic=i; currentTab=0;
  renderTabs(); renderContent();
  document.querySelectorAll('.topic-btn').forEach(function(b,j){b.classList.toggle('active',j===i);});
}
function selectSection(i) {
  currentTab=i; renderContent();
  document.querySelectorAll('.tab').forEach(function(t,j){t.classList.toggle('active',j===i);});
}
document.getElementById('topic-list').innerHTML = DATA.map(function(d,i){
  return '<button class="topic-btn'+(i===0?' active':'')+'" onclick="selectTopic('+i+')">'+
    '<span class="topic-num">'+String(i+1).padStart(2,'0')+'</span>'+d.title+'</button>';
}).join('');
renderTabs(); renderContent();
</script>
</body>
</html>

━━ DATA ARRAY RULES ━━
- Each object = one sidebar topic: { title, subtitle, sections: string[] }
- sections[] must have exactly one HTML string per tab, in TABS order
- Each sections[i] is raw inner HTML — no <html>/<body> wrapper
- Use .card, .highlight, .code-block, .complexity-table, .pattern-card, .smell-row, .problem-card, .interview-pill as appropriate
- For code use .code-block (no markdown fences — raw text inside the div)
- Be substantive: each section 200–500 words of real content
- No markdown syntax anywhere in the output${refContext}`;

  const userMessage = `CATEGORY: ${chapter.category}
TOPIC: ${chapter.title}
DIFFICULTY: ${chapter.complexity}
TAGS: ${chapter.tags.join(', ')}
DESCRIPTION: ${chapter.description}

TABS (use exactly, in this order): ${tabsJson}
Number of tabs: ${tabs.length}

Generate 4–6 DATA entries:
- Entry 0: the main topic "${chapter.title}"
- Entries 1–N: key subtopics / variants / related concepts

Each entry needs sections[] with exactly ${tabs.length} strings (one per tab).
Last tab ("${tabs[tabs.length - 1]}"): use .interview-pill elements for 3–5 FAANG questions + a step-by-step answering framework.

Output the complete HTML file now. Start with <!DOCTYPE html> — nothing else before or after.`;

  try {
    return await callAI(systemPrompt, userMessage, 8000);
  } catch (error) {
    console.error("Error generating chapter content:", error);
    throw error;
  }
}

// ─── Chatbot: context-aware conversation ─────────────────────────────────────
export async function generateChatMessage(chapter, history, userMessage) {
  const provider = getProvider();
  const model    = resolveModel(provider, getSelectedModel());

  const systemPrompt = `You are a senior software engineer and FAANG interview coach embedded inside EngineX. The user is currently studying: "${chapter.title}" (Category: "${chapter.category}").

Your role:
- Answer doubts about "${chapter.title}" with technical precision
- Give additional examples, analogies, or short code snippets when helpful
- If asked something outside this topic, briefly answer then redirect back
- Keep responses concise and conversational — this is chat, not an essay
- Use code when helpful; keep examples short (JavaScript/TypeScript preferred)
- Tone: like a brilliant senior engineer mentoring a junior — direct, friendly, clear
- If asked for a quiz question, generate one relevant MCQ for "${chapter.title}"`;

  // Normalize history: Anthropic & OpenAI use "assistant", Gemini uses "model"
  const msgs = history.map(m => ({ role: m.role, content: m.content }));
  msgs.push({ role: "user", content: userMessage });

  try {
    switch (provider) {
      case "github":
      case "openai": {
        const url   = provider === "github" ? GITHUB_MODELS_API_URL : OPENAI_API_URL;
        const token = provider === "github" ? getGitHubPat()       : getOpenAiKey();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ model, messages: [{ role: "system", content: systemPrompt }, ...msgs], max_tokens: 1200 }),
        });
        if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message || `HTTP ${res.status}`); }
        return (await res.json()).choices[0].message.content;
      }
      case "gemini": {
        const apiKey = getGeminiKey();
        const url    = `${GEMINI_API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const geminiMsgs = msgs.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ system_instruction: { parts: [{ text: systemPrompt }] }, contents: geminiMsgs, generationConfig: { maxOutputTokens: 1200 } }),
        });
        if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message || `HTTP ${res.status}`); }
        return (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      }
      default: {
        const apiKey = getApiKey();
        const res = await fetch(ANTHROPIC_API_URL, {
          method: "POST",
          headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": ANTHROPIC_VERSION, "anthropic-dangerous-direct-browser-access": "true" },
          body: JSON.stringify({ model, max_tokens: 1200, system: systemPrompt, messages: msgs }),
        });
        if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message || `HTTP ${res.status}`); }
        return (await res.json()).content[0].text;
      }
    }
  } catch (error) {
    console.error("Chatbot error:", error);
    throw error;
  }
}

// ─── Generate Chapter Quiz ────────────────────────────────────────────────────
export async function generateChapterQuiz(chapter, numQuestions = 8) {
  const refContext = buildRefContext(chapter);

  const systemPrompt = `You are a technical interviewer generating multiple-choice questions (MCQs) for software engineers preparing for FAANG interviews.
Your task is to generate a JSON array of MCQ objects for the topic: "${chapter.title}".
Generate exactly ${numQuestions} questions. The questions should test deep technical knowledge, algorithmic details, system design tradeoffs, or edge cases.

You MUST return ONLY a valid JSON array. Do not wrap it in markdown block quotes. Do not write any text before or after the JSON array.
Your entire response must parse successfully with JSON.parse().

Each object in the array must have exactly these fields:
- "question": string (the question text)
- "options": array of exactly 4 strings (multiple choice options)
- "correct_index": integer (0, 1, 2, or 3 representing the index of the correct option)
- "explanation": string (1-2 sentences explaining why the choice is correct, citing mechanics or tradeoffs)${refContext}`;

  const userMessage = `Generate a JSON array of ${numQuestions} MCQ objects for the chapter "${chapter.title}" (Category: "${chapter.category}", Tags: ${chapter.tags.join(", ")}).`;

  try {
    let text = await callAI(systemPrompt, userMessage, 3000);
    text = text.trim();

    // Strip markdown code fences if the model added them
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    }

    try {
      const quiz = JSON.parse(text);
      if (!Array.isArray(quiz)) throw new Error("Response is not a JSON array.");
      return quiz;
    } catch {
      // Last-resort: extract the array with regex
      const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) return JSON.parse(match[0]);
      throw new Error("Could not parse quiz JSON. Raw output: " + text.slice(0, 120) + "...");
    }
  } catch (error) {
    console.error("Error generating chapter quiz:", error);
    throw error;
  }
}

