# Agent Context — [Domain Name]

> **What this file is**: A curated index for agents in other workspaces to understand what the [Domain Name] domain exposes. Read this before building any feature that integrates with this domain.
>
> **Maintained by**: [Team Name] | [Slack Channel] | **Last Updated**: YYYY-MM-DD
>
> **Do not** store implementation details, credentials, or content already in a linked spec file here.

---

## Domain Overview

<!-- 
  2-4 sentences. Describe:
  - What business capability this domain owns
  - The key problems it solves
  - Who the primary consumers are (other domains, apps, external systems)
-->

[Domain Name] is responsible for [business capability]. It [key function 1] and [key function 2].
Primary consumers are [downstream domain/team A] and [downstream domain/team B].

---

## Public APIs

REST APIs exposed by this domain for external consumption.

<!-- For each service, link to its OpenAPI spec. Do not paste inline YAML here. -->

### [Service Name]

| Property | Value |
|----------|-------|
| **Base URL (Dev)** | `https://[service].dev.bestbuy.com` |
| **Base URL (Prod)** | `https://[service].bestbuy.com` |
| **Auth** | [e.g., PingFed JWT / STS Token / API Key] |
| **OpenAPI Spec** | [`specs/contracts/[service]-api.yaml`](specs/contracts/[service]-api.yaml) |
| **Postman Collection** | [`specs/contracts/[service].postman.json`](specs/contracts/[service].postman.json) _(if available)_ |

**Key Endpoints** _(summary only — see OpenAPI spec for full details)_:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/[resource]` | `GET` | [Brief description] |
| `/api/v1/[resource]` | `POST` | [Brief description] |
| `/api/v1/[resource]/{id}` | `PUT` | [Brief description] |

<!-- Repeat the above block for each service this domain exposes -->

---

## Published Events

Kafka topics this domain produces that other domains can consume.

<!-- Link to the event schema file. Do not paste inline JSON/Avro here. -->

| Topic | Key | Description | Schema |
|-------|-----|-------------|--------|
| `[topic.name]` | `[key field, e.g. orderId]` | [What this event signals] | [`specs/contracts/events/[event-name].json`](specs/contracts/events/[event-name].json) |
| `[topic.name]` | `[key field]` | [What this event signals] | [`specs/contracts/events/[event-name].json`](specs/contracts/events/[event-name].json) |

**Kafka Cluster**: [e.g., Data Center Kafka / AWS MSK]  
**Consumer Group Prefix Convention**: `[domain-name]-[consumer-name]-cg`

---

## Shared Contracts & Libraries

Published packages or shared DTOs that other teams import directly.

<!-- Only list what is intentionally published for external use -->

| Artifact | Type | Version | Purpose |
|----------|------|---------|---------|
| `com.bestbuy.[domain]:contracts` | Maven/Gradle | `[version]` | Shared request/response DTOs |
| `@bestbuy/[domain]-client` | npm | `[version]` | TypeScript API client |

---

## Key Concepts

<!--
  Domain terminology an agent MUST understand to generate correct code.
  Keep entries concise — 1-2 sentences each.
  Focus on terms that are non-obvious or mean something different in this domain.
-->

| Term | Definition |
|------|-----------|
| **[Term 1]** | [Definition — what it means in this domain context] |
| **[Term 2]** | [Definition] |
| **[Term 3]** | [Definition] |

---

## Upstream Dependencies

Systems and domains this workspace **consumes from**.

<!--
  This helps agents understand mutual coupling.
  Agents in this workspace: use this to understand what you depend on.
  Agents in other workspaces: use this to understand the dependency graph.
-->

| Domain / System | What We Use | Their agent-context.md |
|-----------------|-------------|------------------------|
| [Upstream Domain A] | [e.g., Order status events from topic `order.updated`] | `github.com/bby-corp/[upstream-workspace]` |
| [Upstream Domain B] | [e.g., Product catalog REST API] | `github.com/bby-corp/[upstream-workspace]` |
| [External System] | [e.g., Firebase Cloud Messaging for push notifications] | _(external — no agent-context.md)_ |

---

## What We Do NOT Own

<!--
  Explicitly call out adjacent capabilities that agents might assume belong here.
  Prevents agents from incorrectly placing logic in the wrong domain.
-->

- [Capability X] — owned by [Other Domain]
- [Capability Y] — owned by [Other Domain]

---

## Workspace Structure

Brief map of where things live in this workspace, for agents navigating to specs and contracts.

```
[domain]-workspace/
├── agent-context.md              ← You are here
├── services/
│   └── [service-name]/           ← Service source (subtree from bby-corp/[service-repo])
├── apps/
│   └── [app-name]/               ← App source (subtree from bby-corp/[app-repo])
├── specs/
│   ├── contracts/                ← OpenAPI specs, event schemas, shared DTOs
│   └── ###-[feature-name]/       ← Feature specifications
└── docs/
    └── agent-context/            ← Deeper domain context documents
        ├── domain-overview.md
        └── patterns.md
```

---

## Ownership

| Property | Value |
|----------|-------|
| **Team** | [Team Name] |
| **Slack** | `#[slack-channel]` |
| **Oncall** | [PagerDuty / ServiceNow rotation link] |
| **Product Owner** | [Name] |
| **Tech Lead** | [Name] |
| **Last Updated** | YYYY-MM-DD |
| **Generated By** | `@doc-agent` _(review and edit before committing)_ |
