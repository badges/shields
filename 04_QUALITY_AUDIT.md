# shields — Phase 8: Quality Audit

## Code Quality Overview

| Dimension | Status | Notes |
| --- | --- | --- |
| **ESLint** | ✅ PASS | No errors, using flat config (v9) |
| **Prettier** | ⚠️ Not checked independently | Part of `npm test` (timed out) |
| **TypeScript Types** | ⚠️ Part of `npm test` | `check-types:package` via tsd |
| **Unit Tests** | ⚠️ Part of `npm test` | Core tests slow (~30-60s) |
| **Coverage** | ⚠️ Not run | `coverage:test` available but not executed |
| **Security** | ✅ Dependabot + dependency-review | Active dependency updates |

## Code Quality Tools in Use

### ESLint Configuration

- **Config file:** `eslint.config.js` (flat config format)
- **Parser:** `@typescript-eslint/parser` for TypeScript
- **Key plugins:** chai-friendly, cypress, icedfrisby, import, jsdoc, mocha, prettier, promise, react-hooks, sort-class-members
- **Concurrency:** Auto (for parallel execution)

### Prettier Configuration

- **Config file:** `.prettierrc.yml`
- **Extensions:** `.cjs`, `.mjs`, `.js`, `.ts`, `.md`, `.json`, `.yml`

### Type Checking

- **TypeScript definitions:** `badge-maker/index.d.ts`
- **Type testing:** `badge-maker/index.test-d.ts` via `tsd`
- **Coverage goal:** 100% of frontend, core, and service helper functions

### Coverage

- **Tool:** c8 (v11)
- **Config:** `.c8rc.json`
- **Integration:** `coverage:test:core`, `coverage:test:package`, etc.

### Git Hooks

- **Pre-commit:** `lint-staged` via `simple-git-hooks`
- **Staged files:** ESLint fix + Prettier for code; Prettier for docs/config

## Architecture Quality

### Strengths

1. **Well-documented architecture** — `doc/code-walkthrough.md` explains the entire flow
2. **Clear separation of concerns** — badge-maker (library), core (server), services (badges)
3. **Service test isolation** — Live integration tests catch API changes proactively
4. **Token pooling** — PostgreSQL-backed GitHub token pool avoids rate limits
5. **Error handling** — Structured error classes (NotFound, InvalidResponse, Inaccessible, InvalidParameter)
6. **Snapshot testing** — Prevents unintended SVG/JSON output changes

### Areas of Concern

1. **Monolithic services directory** — 184 service directories with ~80% of codebase
   - High cognitive load for code review
   - Long test runtimes (2000+ live tests)
   - Single point of failure for many external dependencies

2. **Legacy request handler** — `legacy-request-handler.js` described as "gnarly and hard to follow"
   - Technical debt in request processing pipeline
   - Hard to modify without breaking existing routes

3. **got dependency** — Issue #11072 suggests replacing `got` with native `fetch`
   - Maintenance burden (already at v14+)
   - Would be a significant refactor

4. **http-deceiver overrides** — Issue #11497 to remove this legacy workaround
   - Indicates older architecture decisions that need cleanup

5. **Inconsistent naming** — Issues #10847 (camelCase conversion), #10804 (snake_case vs camelCase URL params)
   - Technical debt from historical decisions
   - Affects API consistency

## Testing Quality

### Strengths

1. **Multi-layered testing** — Unit, integration, E2E, live service tests
2. **Snapshot tests** — Catch unintended badge output changes
3. **Service test convention** — PR titles trigger specific service tests
4. **Live integration tests** — Proactively catch upstream API changes

### Weaknesses / Risks

1. **Test execution time** — Full `npm test` times out; core tests take 30-60s
2. **Network dependency** — Service tests require external APIs to be accessible
3. **No coverage enforcement** — Coverage reported to Coveralls but no minimum threshold enforced
4. **Limited unit test coverage in services** — Most service code tested via `.tester.js` live tests
5. **Integration tests opt-in** — Not run by default (requires PostgreSQL)

### Test Coverage Targets

- **Frontend:** 100% (goal)
- **Core:** 100% (goal)
- **Service helper functions:** 100% (goal)
- **Service implementations:** Live tests only (no unit test goal stated)

## Security Quality

### Strengths

1. **Dependency Review** — GitHub Actions `enforce-dependency-review.yml`
2. **Dependabot** — Automated dependency updates (multiple branches)
3. **Sentry integration** — Error reporting in production
4. **Security policy** — `SECURITY.md` documents vulnerability reporting
5. **CC0 license** — No proprietary code concerns

### Observations

1. **Token management** — GitHub tokens stored in PostgreSQL (token-pooling)
   - Connection string should be secured
   - Rotation policy needed

2. **External API calls** — Many services make outbound HTTP requests
   - Rate limiting important
   - No obvious request validation on responses

3. **No SAST/DAST** — No static or dynamic application security testing in CI

## Documentation Quality

### Strengths

1. **Comprehensive README** — Setup, development, architecture, history
2. **CONTRIBUTING.md** — Detailed guidelines for PRs, tests, code review
3. **TUTORIAL.md** — How to add a new badge service
4. **doc/code-walkthrough.md** — High-level architecture explanation
5. **JSDoc integration** — API docs at contributing.shields.io
6. **Badge URL documentation** — `doc/badge-urls.md`

### Gaps

1. **#11261** — Better document configuration option (open issue)
2. **#10753** — Write documentation about use of colours (open issue)
3. **Service documentation** — Each service has minimal docs beyond the badge URL pattern

## CI/CD Quality

### Workflows (23 total)

| Workflow | Quality |
| --- | --- |
| `test-main.yml` | ✅ PR test gate |
| `test-services.yml` | ✅ Service-specific tests via PR convention |
| `test-lint.yml` | ✅ ESLint + Prettier |
| `test-e2e.yml` | ✅ Cypress tests |
| `test-integration.yml` | ✅ PostgreSQL tests |
| `coveralls-code-coverage.yml` | ✅ Coverage reporting |
| `danger.yml` | ✅ PR automation |
| `deploy-review-app.yml` | ✅ Heroku review apps |
| `daily-tests.yml` | ✅ Full suite on schedule |
| `update-simple-icons.yml` | ✅ Automated logo updates |
| `update-github-api.yml` | ✅ Automated API updates |
| `enforce-dependency-review.yml` | ✅ Dependency security |

### Gaps

1. **No Concurrency limits** visible on workflows — could have resource contention
2. **No test parallelization** strategy visible in `test-main.yml`
3. **Daily tests** are separate from PR checks — could miss issues earlier

## Dependency Quality

### Dependency Strategy

- **Node.js constraint:** ^22 || ^24 (recent, LTS)
- **NPM constraint:** ^10 || >=11.0.0 <11.12.0 (narrow, specific)
- **Lock file:** `package-lock.json` (committed)
- **Dev dependencies:** Extensive (linting, testing, building)

### Notable Dependencies

| Dependency | Purpose | Risk |
| --- | --- | --- |
| `got` | HTTP client | Issue #11072 (replace with fetch) |
| `joi` | Validation | Good, well-maintained |
| `semver` | Version parsing | Good |
| `pg` | PostgreSQL client | Good |
| `graphql` + `graphql-tag` | GitHub API | Good |
| `simple-icons` | Logo library | Auto-updated weekly |
| `docusaurus` | Documentation site | Good, React-based |
| `cypress` | E2E testing | Good |

### Dependency Update Strategy

- **Dependabot:** Active on npm packages and GitHub Actions
- **Renovate:** Mentioned in deps (PEP440, ruby-semver)
- **simple-icons:** Weekly automated updates

## Performance Quality

### Observations

1. **Badge rendering** is the core performance concern
2. **Benchmarking tool available:** `npm run benchmark:badge`
3. **CDN caching** — 40% of production requests cached by Cloudflare
4. **Badge caching** — LRU cache per service instance
5. **Token pooling** — Reduces GitHub API calls via pooling

### Potential Issues

1. **No rate limiting on badge generation** visible
2. **No request queuing** visible
3. **Memory concerns** — LRU cache could grow unbounded

## Maintainability Quality

### Strengths

1. **Clear patterns** — Service implementation follows consistent pattern
2. **BaseService abstraction** — Reduces boilerplate for new services
3. **Prettier enforcement** — Consistent formatting
4. **Git hooks** — Automated quality checks

### Concerns

1. **184 services in one repo** — Cognitive load
2. **PR title convention** — Easy to miss, build failures if forgotten
3. **Service test naming** — Case-insensitive matching can cause confusion
4. **Large `package.json`** — 221 lines with many scripts
5. **ESM migration** — Project uses `"type": "module"` which adds complexity

## Recommendations

### High Priority

1. **Address test timeouts** — Investigate why `npm test` times out; consider splitting or optimizing
2. **Document http-deceiver removal plan** — Issue #11497
3. **Replace got with native fetch** — Issue #11072 (long-term)

### Medium Priority

1. **Add coverage enforcement** — Minimum threshold in CI
2. **Improve service test isolation** — Some tests may have interdependencies
3. **Address naming inconsistencies** — Issues #10847, #10804
4. **Expand unit tests for services** — Reduce reliance on live tests

### Low Priority / Nice to Have

1. **Add SAST/DAST scanning**
2. **Improve error messages** — Some errors still result in "shields internal error"
3. **Better badge debugging tools** — `npm run badge` exists but could be improved
4. **Service documentation generation** — Auto-generate docs from JSDoc
