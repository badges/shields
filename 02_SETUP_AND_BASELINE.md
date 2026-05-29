# 02_SETUP_AND_BASELINE.md — Setup & Baseline Checks

## Environment Setup Summary

### Prerequisites Verified

- ✅ Node v24.16.0 (required `>=24 <26`)
- ✅ npm 11.13.0
- ✅ pnpm 11.2.2
- ✅ Git configured
- ✅ `userData/` directory created for SQLite database

### Installation

```sh
npm install
# Completed: 1587 packages, 72 vulnerabilities (moderate)
```

### Pre-commit Hooks

```sh
npm run init-precommit
# ✅ Husky hooks installed successfully
```

## Baseline Check Results

| Check | Command | Result | Notes |
| --- | --- | --- | --- |
| **Format** | `npm run fmt:check` | ⚠️ 1 file | `00_STATE.md` has formatting issues |
| **Lint** | `npm run lint` | ✅ 0 errors | Clean across 1083 files |
| **Type-check** | `npm run ts` | ✅ 0 errors | Both `ts:main` and `ts:workers` pass |
| **Unit tests** | `npm test` | ❌ 6 failures | Electron binary not installed in CI environment |
| **Pre-commit hooks** | `npm run init-precommit` | ✅ Success | Husky installed |

### Format Issues

- `00_STATE.md` — Run `npm run fmt` to fix (markdown formatting)

### Test Failures (all Electron-related)

```
Error: Electron failed to install correctly, please delete node_modules/electron and try installing again
```

- 21 test files failed, 6 individual test failures
- All failures in `neon_prompt_context.test.ts` and `executeAddDependency.test.ts`
- Root cause: Electron binary not available in the container environment
- 1087 tests passed out of 1093 total

### Type-check: Clean

```
> npm run ts:main
  npx tsgo -p tsconfig.app.json --noEmit --incremental
  ✅ No errors

> npm run ts:workers
  npx tsc -p workers/tsc/tsconfig.json --noEmit --incremental
  ✅ No errors
```

### Lint: Clean

```
Found 0 warnings and 0 errors.
Finished in 282ms on 1083 files with 88 rules using 2 threads.
```

## Build Status

- ❌ **`npm run build`** — Not run; requires full Electron Forge chain and native binaries
- ❌ **E2E tests** — Not run; requires `npm run build` first (tests run against built app)

## Key Commands Reference

```sh
# Development
npm start              # Run Electron app (dev mode)
npm run dev            # Development mode with NODE_ENV=development

# Pre-commit checks (MUST run before commit)
npm run fmt            # Auto-fix formatting
npm run lint:fix       # Auto-fix lint errors
npm run ts             # Type-check (NOT tsc directly!)

# Testing
npm test               # Unit tests (Vitest)
npm run e2e            # E2E tests (requires prior build)
npm run build          # Build app before E2E tests

# Database
npm run db:generate    # Generate Drizzle migrations
npm run db:push         # Push schema to SQLite
npm run db:studio      # Open Drizzle Studio
```

## Notes

1. **Never run `npx tsc` or `tsc` directly** — always use `npm run ts` (wraps with tsgo/tsconfig)
2. **Never run `npx eslint` directly** — project uses oxlint; eslint produces false positives on `@/` path aliases
3. **E2E tests require prior build** — `npm run build` must be run before `npm run e2e`
4. **Electron not available in container** — unit tests that depend on Electron binary will fail in this environment
