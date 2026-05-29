# 01_REPO_MAP.md — Repository Map

## Directory Structure

```
dyad/
├── .claude/              # Claude Code agent settings
├── .github/
│   └── workflows/        # CI (ci.yml), CLA, issue templates
├── .husky/               # Git hooks (pre-commit via husky)
├── assets/               # Static assets (logos, images)
├── docs/                 # Architecture docs, ADRs, guides
│   ├── architecture.md
│   ├── agent_architecture.md
│   └── ...
├── drizzle/              # Drizzle ORM migrations
├── e2e-tests/            # Playwright E2E test suite
├── packages/              # Internal workspace packages
├── plans/                 # Feature plans / specifications
├── rules/                 # Contribution rules (17 rule files)
├── scaffold/             # App template used for `Create New App`
│   ├── src/
│   ├── package.json
│   └── ...
├── scripts/              # Build/release scripts
├── shared/               # Shared TypeScript utilities
├── src/                   # Main source (see sub-structure below)
├── testing/              # Fake LLM server for E2E tests
├── tools/                # Internal tooling
└── workers/              # TypeScript worker processes (TSC worker, etc.)
```

## src/ Sub-structure

```
src/
├── __tests__/            # Unit tests (Vitest)
├── app/                  # App-level setup (theme, providers)
├── atoms/                # Jotai state atoms
├── components/           # React components (chat, UI, editor)
├── constants/            # App constants
├── contexts/             # React contexts
├── data/                 # Data layer (entities, loaders)
├── db/                   # Drizzle schema and migrations
│   └── schema.ts
├── errors/               # Error types (DyadError, DyadErrorKind)
├── hooks/                # Custom React hooks
├── i18n/                 # i18next translations
├── ipc/                  # IPC layer (main ↔ renderer communication)
│   ├── contracts/       # IPC channel type contracts
│   ├── handlers/        # Main-process IPC handlers
│   │   ├── local_agent/ # Agent v2 (local agent mode) handlers
│   │   └── ...
│   ├── preload/         # Preload script bridge
│   ├── processors/      # IPC processors (response processor, etc.)
│   ├── services/        # IPC services
│   └── utils/
├── lib/                  # Library utilities
├── main/                 # Electron main process entry
├── neon_admin/           # Neon admin utilities
├── pages/                # Page components (routed via TanStack Router)
├── paths/                # Path constants
├── pro/                  # Pro-tier source (FSL license)
│   ├── main/
│   └── shared/
├── prompts/             # AI prompt templates and system prompts
├── routes/               # TanStack Router route definitions
├── store/               # State store
├── styles/               # Global styles and Tailwind config
├── supabase_admin/       # Supabase admin utilities
└── utils/                # General utilities
```

## Key Files

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Agent contribution guide — must-read for AI agents |
| `CONTRIBUTING.md` | Human contributor guide |
| `package.json` | Workspace root (pnpm), scripts, dependencies |
| `forge.config.ts` | Electron Forge packaging configuration |
| `playwright.config.ts` | E2E test runner config |
| `vitest.config.ts` | Unit test configuration |
| `tsconfig.app.json` | Main TypeScript config |
| `rules/` | 17 contribution rule files covering IPC, DB, E2E, Git, etc. |
| `src/prompts/system_prompt.ts` | Core AI system prompt with `<dyad-*>` XML tags |
| `src/ipc/processors/response_processor.ts` | Processes AI responses, executes `<dyad-*>` tags |

## Technology Stack

| Layer | Technology |
| --- | --- |
| **App shell** | Electron 40 |
| **UI framework** | React 19 |
| **Routing** | TanStack Router |
| **State (global)** | Jotai atoms |
| **Data fetching** | TanStack Query |
| **Styling** | Tailwind CSS v4 + Base UI components |
| **Database** | Drizzle ORM + better-sqlite3 (local SQLite) |
| **AI SDK** | Vercel AI SDK (`ai` package) with multi-provider support |
| **Editor** | Lexical (rich text) + Monaco Editor (code) |
| **Canvas** | Konva + react-konva |
| **i18n** | i18next + react-i18next |
| **Testing (unit)** | Vitest |
| **Testing (E2E)** | Playwright |
| **Linting** | oxlint + oxfmt (NOT ESLint) |
| **Type-checking** | tsgo (custom wrapper, NOT raw tsc) |

## Git Remotes

```
origin  https://github.com/Arvuno/dyad.git  (fork)
# upstream not configured yet — add with:
#   git remote add upstream https://github.com/dyad-sh/dyad.git
```

## Notable Architectural Decisions

1. **XML-tag tool protocol** — AI responds with `<dyad-*>` XML tags rather than function calls, parsed by `DyadMarkdownParser` and executed by `response_processor.ts`
2. **Send entire codebase** — Each AI request includes the full codebase (cost-saving measure vs iterative search)
3. **Dual license** — `src/pro` is fair-source (FSL); rest is Apache 2.0
4. **No raw `tsc`** — Type-checking must go through `npm run ts` which uses `tsgo`
5. **No ESLint** — Project uses `oxlint`; running `npx eslint` produces false positives
6. **Base UI only** — All UI primitives must use `@base-ui/react`, never Radix UI
