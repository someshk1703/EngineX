# EngineX - GitHub Copilot Instructions

**Domain**: EngineX
**Tech Stack**: javascript
**Workflow**: Agentic Development (powered by @bestbuy/agentic-dev-toolkit)

---

## Project Structure

<!-- 📋 IMPORTANT: Define your project structure here. Agents read this to understand where code lives. -->

**Structure Type**: <!-- monorepo | single-app -->

```
EngineX/
├── .github/           # Agents, instructions, workflows
├── .specify/          # Spec Kit templates, constitution
├── specs/             # Feature specifications
├── docs/              # Documentation
<!-- Add your structure below -->
├── src/               # Source code
├── test/              # Tests
└── README.md
```

**Key Directories**:
- **Source Code**: `src/` <!-- Update to match your structure (e.g., services/, apps/, libs/) -->
- **Tests**: `test/` <!-- Update to match your structure -->
- **Shared Code**: <!-- Document where shared/common code lives -->
- **Contracts**: <!-- Document where API contracts/DTOs live -->

---

## Active Features

<!-- Features in development will be listed here -->

---

## Domain-Specific Context

<!-- Add domain-specific information here -->

---

## Tech Stack

- **Primary Language**: javascript
- **Framework**: <!-- Add framework details -->
- **Database**: <!-- Add database details -->
- **Messaging**: <!-- Add messaging details -->

---

## Development Workflow

### Feature Development
1. **Intake**: `@intake` creates `docs/intake/{feature}.md`
2. **Specification**: `/speckit.specify` creates `specs/###-feature/spec.md`
3. **Planning**: `/speckit.plan` creates plan, research, data model, contracts
4. **Tasks**: `/speckit.tasks` creates executable task breakdown
5. **Implementation**: Execute tasks with comprehensive testing

### Architecture Documentation Rule

> **MANDATORY**: After every confirmed and committed change to the application, update `docs/app-architecture.md`.

This applies whenever any of the following change:
- Component tree (new, removed, or renamed components)
- Routing / view state machine (new views or navigation paths)
- Data model (new fields in `topics.js`, `docsMap.js`, or any data file)
- `localStorage` keys (new, removed, or renamed keys)
- Services (`claudeService.js`, `supabaseClient.js`, or new service files)
- New files or directories added to `src/`, `html/`, `docs/`, or project root
- Dependencies added/removed in `package.json`
- Planned features section (move items from Planned → implemented when done)

The `Last updated` date in `docs/app-architecture.md` must match the commit date.

---

## Quality Gates

From Constitution:
- ✅ Minimum 80% test coverage
- ✅ All tests pass
- ✅ No critical linting issues
- ✅ Code follows constitution principles
- ✅ Documentation added for public APIs

---

<!-- AUTO-UPDATE: Do not manually edit below this line -->
