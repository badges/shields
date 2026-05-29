# 03_ISSUE_TRIAGE.md — Issue Triage Report

## Overview

| Metric                     | Count |
| -------------------------- | ----- |
| **Open issues (non-PR)**   | 80    |
| **Open pull requests**     | 20    |
| **Bug reports**            | ~35   |
| **Feature requests**       | ~25   |
| **Workflow/health issues** | 3     |
| **Security issues**        | 1     |

## High-Priority Issues

### 🔴 Security (1)

| # | Title | Labels |
| --- | --- | --- |
| #3502 | [Security] GitHub OAuth token stored in plain text inside git remote URL | `bug`, `prioritized`, `pro` |

### 🔴 Critical Bugs (2)

| # | Title | Labels |
| --- | --- | --- |
| #3240 | CRITICAL Bug: Dyad crashing mid-session on large GLM-5.1 prompts (Memory/Cache?) + Agent Roadmap question | `bug` |
| #3058 | MAJOR architectural issue with Dyad! | `bug` |

### 🟠 P0 Bugs (bugs labeled `prioritized` or high-impact)

| # | Title | Labels |
| --- | --- | --- |
| #3517 | [bug] Mode switch (Build → Plan) forces new chat but drops attached components | `bug`, `pro` |
| #3513 | Windows: project setup fails when user profile path contains spaces | `bug` |
| #3506 | [bug] <WRITE TITLE HERE> — untitled bug | `bug` |
| #3505 | Bug when setting code context in V1.0 | `bug` |
| #3500 | The built-in browser version is still the same AND buggy! | `bug` |
| #3497 | add_dependency tool fails with EINVALIDTAGNAME when installing packages | `bug`, `pro` |
| #3499 | Setting the port for the local app server | `bug` |

### 🟡 Important Bug Reports

| # | Title | Labels |
| --- | --- | --- |
| #3490 | Force Close | — |
| #3469 | [bug] Error in Dyad application | — |
| #3462 | React Three Fiber findInitialRoot error when building 3D object manager app | `bug` |
| #3461 | [bug] <React Three Fiber findInitialRoot error when building 3D app> | `bug` |
| #3448 | Select component and active annotator does not work with GitHub imported apps | `bug`, `issue/incomplete` |
| #3377 | [bug] "Sync to GitHub" fails to push changes / No Vercel deployment triggered 🚨 | `bug` |
| #3360 | [bug] TSC worker exited with code 1 on Windows | `bug`, `issue/incomplete` |
| #3343 | [bug] Browser pop out shows blank screen | `bug`, `pro` |
| #3338 | Local git Review & commit does not work | `bug` |
| #3285 | [bug] Database connection is not open error | `bug`, `issue/incomplete` |
| #3204 | App deletion does not go to trash and causes permanent data loss | `feature request`, `pro` |
| #3135 | Restoring older local git versions destroys newer versions | `bug` |
| #3116 | [bug] App crashes on open when clicking chat | `bug` |
| #3051 | [bug] Vercel deploy fails: Login Connection required for GitHub | `bug`, `pro` |
| #3030 | [bug] Dyad always switches to new chat in Plan mode | `bug` |
| #2984 | Tools (bug) | `bug` |

## Feature Requests

### 🎯 High-Value Requests

| # | Title | Labels |
| --- | --- | --- |
| #3494 | Password Protect Application | `feature request` |
| #3476 | Create Neon integration guide & in-app guidance | — |
| #3470 | Recover From Force Close | `feature request` |
| #3463 | Is there a version that doesn't use the 'app builder'? | `feature request` |
| #3456 | Support MCP OAuth | `feature request` |
| #3449 | Feature request to add docker yml | `feature request` |
| #3427 | Support /skills | `feature request` |
| #3426 | Support /goal (long-running outcomes) | `feature request` |
| #3385 | Support OpenAI /v1/responses API format for custom providers | `feature request` |
| #3373 | If We Didn't Update All Edge Functions Why Deploy Them All? | `bug`, `feature request` |
| #3310 | Making it easier to run Dyad on own HW | `feature request` |
| #3306 | AppWrite integration | `feature request` |
| #3299 | Add configurable hooks into flows like Create New App | `feature request` |
| #3295 | Make bulk deployment of many edge functions (>100) faster | `feature request` |
| #3290 | AWS Bedrock auth via AWS credential provider chain | `feature request` |
| #3255 | support caveman / more compact output | `feature request` |
| #3175 | Allow Dyad to use computer (e.g. browse, self-test, etc.) | `feature request` |
| #3164 | Stop and write button | `feature request` |
| #3130 | Add template for Svelte / SvelteKit | `feature request` |
| #3095 | There has to be a Reset button to avoid these locks | `bug`, `feature request` |
| #3092 | Multi‑Account Vercel Integration for Dyad (Simultaneous Accounts) | `feature request` |
| #3078 | Ability to Integrate Self Hosted Convex Database and Self Hosted Supabase | `feature request` |
| #3050 | Add Claude API integration in Providers settings | `feature request` |
| #3008 | Pull all prompts from a certain version to another | `feature request` |

### 🔧 Technical/Integration Requests

| # | Title | Labels |
| --- | --- | --- |
| #3391 | [WSL/Ubuntu] [Github connection] Cannot connect github | `response requested` |
| #3379 | pnpm command not found on macOS | `bug`, `issue/incomplete` |

## Workflow Health Issues

| # | Title | Impact |
| --- | --- | --- |
| #3496 | Workflow issues: Claude API spending cap and Mailgun auth failure | CI/auth |
| #3454 | Workflow issues: Codex PR Review authentication token expired | PR review |
| #3447 | Workflow issues: CI consistently failing on main branch | CI reliability |

## Active Pull Requests

### 🤖 AI-Agent-Generated PRs (keppo-bot, codex)

| # | Title | Status |
| --- | --- | --- |
| #3528 | Deflake E2E failures from CI run 26543573932 | Open |
| #3527 | Validate provider API keys before AI requests | Open |
| #3441 | Surface settings write failures | `needs-human:review-issue` |
| #3440 | Constrain app file IPC paths | `needs-human:review-issue` |

### 👤 Human-Authored PRs (wwwillchen — maintainer)

| # | Title | Status |
| --- | --- | --- |
| #3526 | Filter generic TypeError fetch failed from PostHog telemetry | Open |
| #3525 | Filter missing TypeScript setup errors from PostHog telemetry | Open |
| #3524 | Enrich app:initial-load telemetry and stop sampling it for non-Pro users | `needs-human:final-check` |
| #3523 | Filter Ollama connection telemetry | `needs-human:final-check` |

### 👤 External Contributors

| # | Title | Author | Status |
| --- | --- | --- | --- |
| #3515 | Deterministic per-app port for the preview proxy worker | @azizmejri1 | `needs-human:review-issue` |
| #3511 | Vendor ts-pg-schema-diff and use it for Neon migrations | @wwwillchen | `needs-human:final-check` |
| #3501 | Add Neon Auth env vars to deployment environment panel | @azizmejri1 | `needs-human:review-issue` |
| #3495 | feat: Add OAuth support for MCP servers | @RyanGroch | `needs-human:review-issue` |
| #3491 | Describe migration mechanism in Neon system prompt | @azizmejri1 | `needs-human:review-issue` |
| #3489 | add automatique upgrade in app import | @nourzakhama2003 | `needs-human:review-issue` |
| #3487 | Bypass Corepack project pnpm pins for install policy | @wwwillchen | `needs-human:review-issue` |
| #3472 | Refactor preview atom state ownership | @wwwillchen | `needs-human:review-issue` |
| #3459 | feat: call MCP tools from sandboxed execute scripts | @RyanGroch | `needs-human:review-issue` |
| #3452 | Add in-chat terminal drawer | @keppo-bot[bot] | `needs-human:review-issue` |
| #3403 | Add app collections to organize apps | @azizmejri1 | `needs-human:final-check` |
| #3365 | Add product nudges | @wwwillchen | `needs-human:final-check` |

## Issue Distribution by Label

| Label                      | Count |
| -------------------------- | ----- |
| `bug`                      | ~35   |
| `feature request`          | ~25   |
| `pro`                      | ~15   |
| `issue/incomplete`         | ~8    |
| `needs-human:final-check`  | 5     |
| `needs-human:review-issue` | ~10   |
| `workflow-health`          | 3     |
| `prioritized`              | 1     |
| `Security`                 | 1     |

## Triage Recommendations

### Immediate Actions

1. **#3502 Security** — GitHub OAuth token in plain text. Requires immediate fix.
2. **#3240 Critical crash** — Memory/cache issue causing crashes mid-session.
3. **#3058 Architectural issue** — Major issue flagged but not yet addressed.

### Good First Issues (low-hanging fruit)

- #3499 — Setting the port for the local app server (small, well-scoped)
- #3343 — Browser popup blank screen (reproducible?)
- #3338 — Local git Review & commit does not work

### High-Value Feature Work

- #3494 — Password Protect Application (security-adjacent, Pro feature)
- #3456 — Support MCP OAuth (interops with MCP ecosystem)
- #3427 — Support /skills (agent command interface)
- #3385 — Support OpenAI /v1/responses API format

### PR Reviews Priority Order

1. **#3526, #3525** — Telemetry filtering (low risk, well-scoped, by maintainer)
2. **#3524, #3523** — Telemetry enrichment/filtering (labeled `needs-human:final-check`)
3. **#3511** — ts-pg-schema-diff vendor (architectural change, needs careful review)
4. **#3403** — App collections (significant feature addition)
