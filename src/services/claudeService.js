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

export async function generateChapterContent(chapter) {
  const refContext = buildRefContext(chapter);

  const systemPrompt = `You are a world-class software engineering educator and FAANG interview coach. Generate a comprehensive study chapter in clean Markdown.

━━ OUTPUT FORMAT ━━
Return ONLY valid Markdown. No HTML. No preamble or explanation outside the document.
Use exactly these headings in this order — nothing more:

# {chapter title}

## Overview
2–3 sentences covering what it is and why it matters.

## Core Concepts
Key ideas, definitions, and mental models. Use sub-headings (###) only when truly distinct sub-topics require it.

## Complexity
A concise table or bullet list of time/space complexities for the main operations.

## Code Example
One focused, well-commented code snippet (JavaScript preferred) demonstrating the canonical implementation.

## Patterns & When to Use
Bullet list of 3–5 recognition signals / patterns ("Use when…").

## Interview Tips
3–5 bullet points: common pitfalls, edge cases, and FAANG talking points.${refContext}`;

  const userMessage = `CATEGORY: ${chapter.category}
TOPIC: ${chapter.title}
DIFFICULTY: ${chapter.complexity}
TAGS: ${chapter.tags.join(', ')}
DESCRIPTION: ${chapter.description}

Generate the chapter now. Start with # ${chapter.title} — nothing before or after the Markdown.`;

  try {
    return await callAI(systemPrompt, userMessage, 4000);
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

// ─── EX-Coder chatbot: coding-problem-aware conversation ─────────────────────
export async function generateCoderChatMessage(question, code, language, history, userMessage) {
  const provider = getProvider();
  const model    = resolveModel(provider, getSelectedModel());

  const codeBlock = code?.trim()
    ? `\n\nThe candidate's current ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``
    : "";

  const systemPrompt = `You are a senior software engineer and FAANG interview coach embedded inside EngineX's EX-Coder tool. The user is working on the problem: "${question.title}" (${question._cat || question.category || ""}).

PROBLEM: ${question.description || question.question || ""}

Your role:
- Help the user think through the problem, debug their code, and understand tradeoffs — nudge them toward the answer rather than just handing over a full solution unless they explicitly ask for it
- Reference their current code when relevant
- Keep responses concise and conversational — this is chat, not an essay
- Use code when helpful; keep examples short
- Tone: like a brilliant senior engineer mentoring a junior — direct, friendly, clear${codeBlock}`;

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
    console.error("Coder chatbot error:", error);
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

// ─── EX-Coder: AI code evaluation ─────────────────────────────────────────────
// Judges a candidate's typed solution against a DSA/Java question the same way
// a human interviewer would — no code execution, purely LLM review.
export async function evaluateCode(question, code, language) {
  const systemPrompt = `You are a senior software engineer acting as a strict but constructive code reviewer for a FAANG-style technical interview practice tool.

You will be given a coding problem and a candidate's solution written in ${language}. Evaluate it as an interviewer would: reason through the logic line by line, check correctness against the stated examples and constraints, and assess efficiency.

The candidate is only expected to write the core algorithm/method itself, exactly like a whiteboard or LeetCode-style answer. Do NOT require, expect, or penalize the absence of a runnable program wrapper — no "public class Main", no "public static void main", no package declarations or import statements. Judge only the algorithmic logic, data structures, and correctness of the code actually written; never comment on or deduct points for missing boilerplate/entry-point code.

You MUST return ONLY a valid JSON object. Do not wrap it in markdown code fences. Do not write any text before or after the JSON.
Your entire response must parse successfully with JSON.parse(). Follow these strict JSON rules:
- Every string value must be plain text on a single line — never include literal line breaks inside a string; use " " or "; " instead of a newline.
- Escape every double-quote character that appears inside a string value as \\".
- Do not use markdown code fences or backtick code blocks inside string values; refer to identifiers/code in plain text instead.
- Keep every string field concise (under ~200 characters) so the response stays short and valid.

The JSON object must have exactly these fields:
- "verdict": one of "correct", "partially_correct", "incorrect" — does the solution solve the problem?
- "score": integer 0-100 — overall quality score (correctness + efficiency + code quality)
- "summary": string — 1-2 sentence overall assessment
- "complexity": { "time": string, "space": string, "assessment": string } — Big-O of the submitted code and whether it's optimal for this problem
- "strengths": array of strings — what the candidate did well (empty array if none)
- "issues": array of strings — bugs, missed edge cases, or correctness problems (empty array if none)
- "suggestions": array of strings — concrete improvements: style, efficiency, readability (empty array if none)
- "edgeCasesMissed": array of strings — specific edge cases not handled (empty array if none)`;

  const examplesBlock = question.examples?.length
    ? `EXAMPLES:\n${question.examples.map(ex => `Input: ${ex.input}\nOutput: ${ex.output}`).join("\n")}`
    : "";
  const constraintsBlock = question.constraints?.length
    ? `CONSTRAINTS:\n${question.constraints.join("\n")}`
    : "";

  const userMessage = `PROBLEM: ${question.title}
CATEGORY: ${question._cat || question.category || ""}
DIFFICULTY: ${question.difficulty || "N/A"}
DESCRIPTION: ${question.description || question.question || ""}
${examplesBlock}
${constraintsBlock}

CANDIDATE'S ${language.toUpperCase()} SOLUTION:
\`\`\`${language}
${code}
\`\`\`

Evaluate this solution now.`;

  const stripFences = (raw) => {
    let t = raw.trim();
    if (t.startsWith("```")) t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    return t;
  };

  const tryParse = (raw) => {
    try { return JSON.parse(raw); } catch { /* fall through */ }
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) { try { return JSON.parse(match[0]); } catch { /* fall through */ } }
    return null;
  };

  try {
    const first = stripFences(await callAI(systemPrompt, userMessage, 3000));
    let parsed = tryParse(first);
    if (parsed) return parsed;

    // First attempt produced invalid/truncated JSON — ask the model to repair it rather than failing outright.
    const repairPrompt = `Your previous response was not valid, complete JSON and could not be parsed. Return ONLY a corrected, complete, valid JSON object with the exact same fields as requested. Keep every string field short (under 150 characters), on a single line, with any double-quotes escaped as \\". Do not add commentary or code fences.

BROKEN RESPONSE:
${first.slice(0, 4000)}`;
    const repaired = stripFences(await callAI(systemPrompt, repairPrompt, 3000));
    parsed = tryParse(repaired);
    if (parsed) return parsed;

    throw new Error("Could not parse evaluation JSON after a repair attempt. Raw output: " + repaired.slice(0, 120) + "...");
  } catch (error) {
    console.error("Error evaluating code:", error);
    throw error;
  }
}

