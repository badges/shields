# 00_STATE.md — Repository State

## Identification

| Field | Value |
| --- | --- |
| **Original repo** | `dyad-sh/dyad` (GitHub Organization: dyad-sh) |
| **Fork** | `Arvuno/dyad` (forked 2026-05-28) |
| **Clone path** | `/root/hard-pr-1/repos/dyad/` |
| **Current commit** | `a6515708` — "Deflake E2E failures from CI run 26526502867 (#3519)" |
| **Default branch** | `main` |
| **Total commits** | 1438 |
| **Latest tag** | `v1.1.0` |
| **License** | `Apache 2.0` (src/ outside `src/pro`) + `FSL 1.1 Apache 2.0` (`src/pro`) |

## Metadata

- **Type**: Electron desktop app (cross-platform: macOS, Windows, Linux)
- **Language**: TypeScript (primary), JavaScript
- **Framework**: React 19 (renderer), Electron 40 (main/preload)
- **Package manager**: pnpm v11+ (workspace monorepo)
- **Node constraint**: `>=24 <26` (Node 24 required)
- **Package ecosystem**: npm (for published package), pnpm (for workspace dev)
- **Versioning**: Semver — current `1.1.0`

## Repository Health

| Metric | Value |
| --- | --- |
| **Open issues** | ~255 |
| **Forks** | 2412 |
| **Stars** | 20448 |
| **Watchers** | 20448 |
| **Open PRs** | 10 active PRs (as of 2026-05-28) |
| **Last commit** | 2026-05-27 (a6515708, keppo-bot) |
| **Main branch push protection** | Yes — requires PR review workflow |
| **Automated CI** | Yes — GitHub Actions (`.github/workflows/ci.yml`) |
| **CLA required** | Yes (`.github/workflows/cla.yml`) |

## Local Working Environment

| Field | Value |
| --- | --- |
| **Node version** | v24.16.0 (installed via `n`) |
| **npm version** | 11.13.0 |
| **pnpm version** | 11.2.2 |
| **userData dir created** | `/root/hard-pr-1/repos/dyad/userData/` |
| **npm install** | Completed (1587 packages, 72 vulnerabilities) |
| **Unit tests** | Skipped — Electron not fully installed in CI environment |
| **Build artifacts** | Not built — requires full Electron Forge chain |

## Upstream Remote

```
origin  https://github.com/Arvuno/dyad.git (fetch)
origin  https://github.com/Arvuno/dyad.git (push)
```

To add upstream for submitting PRs:

```sh
git remote add upstream https://github.com/dyad-sh/dyad.git
```

## CI/CD Pipeline

- **Main CI**: `.github/workflows/ci.yml` — runs on push to `main` and PR events
- **Skips tests** when only `.claude/` or `rules/` files change
- **Matrix strategy**: OS (ubuntu, macos, windows) × E2E shards
- **E2E framework**: Playwright (`playwright.config.ts`)
- **Fake LLM server**: `testing/fake-llm-server/` for isolated E2E testing
- **Linting**: `oxlint` + `oxfmt` (not ESLint)
- **Type-checking**: `tsgo` (not raw `tsc`)

## Key Constraints

1. **Node >=24 <26** — Single hardest constraint. Container Node was v22 — upgraded to v24.
2. **Electron binary** — Not pre-installed in this environment; some tests fail due to missing Electron binary even with `--ignore-engines`.
3. **No pre-built app binary** — `npm run build` requires full Electron Forge chain.
4. **License duality** — Apache 2.0 for general code; FSL for `src/pro`.
