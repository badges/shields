# 06_SELECTED_5_PR_PLAN.md — Shields Selected 5-PR Plan

## Selected PRs

| # | Candidate ID | Title | Type | Risk | Size | Rationale |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | S-01 | docs: fix broken link to tutorial on contributing.shields.io | docs | LOW | ~10 | Issue #4139, trivial fix |
| 2 | S-04 | docs: add note about required environment variables for local dev | docs | LOW | ~50 | Audit finding, helps contributors |
| 3 | S-07 | docs: add troubleshooting section for common service badge failures | docs | LOW | ~80 | Audit finding, useful for community |
| 4 | S-08 | chore: add package metadata validation for badge services | chore | LOW | ~40 | Audit finding, improves code quality |
| 5 | S-10 | docs: clarify token pool configuration in README | docs | LOW | ~30 | Audit finding, clarifies setup |

---

## PR #1: S-01 — docs: fix broken link to tutorial on contributing.shields.io

**Linked Issue:** #4139 **Source:** issue triage **Target Files:** doc/, CONTRIBUTING.md, or relevant docs

### Problem

Link to tutorial on `contributing.shields.io/index.html` is broken.

### Solution

1. Find the broken link in docs
2. Fix or remove the broken reference

### Implementation Plan

1. Search for `contributing.shields.io` in codebase
2. Fix or remove the reference

---

## PR #2: S-04 — docs: add note about required environment variables for local dev

**Linked Issue:** none **Source:** quality audit **Target Files:** CONTRIBUTING.md

### Problem

Developers don't know which environment variables are required for local development.

### Solution

Add a section in CONTRIBUTING.md listing required env vars (NODE_ENV, tokens, etc.)

### Implementation Plan

1. Read CONTRIBUTING.md
2. Identify appropriate location
3. Add env var documentation section

---

## PR #3: S-07 — docs: add troubleshooting section for common service badge failures

**Linked Issue:** none **Source:** quality audit **Target Files:** CONTRIBUTING.md

### Problem

Contributors hit common service badge failures (upstream API issues, token exhaustion) with no troubleshooting help.

### Solution

Add a troubleshooting section to CONTRIBUTING.md covering:

- Upstream API timeout handling
- Token pool exhaustion resolution
- Common badge rendering failures
- How to run service-specific tests

---

## PR #4: S-08 — chore: add package metadata validation for badge services

**Linked Issue:** none **Source:** quality audit **Target Files:** `core/base-service.js` or similar

### Problem

Badge services may be missing required metadata without validation.

### Solution

Add schema validation for badge service package metadata in base service.

### Implementation Plan

1. Find base service class
2. Add metadata validation
3. Run tests to verify

---

## PR #5: S-10 — docs: clarify token pool configuration in README

**Linked Issue:** none **Source:** quality audit **Target Files:** README.md

### Problem

Token pool configuration is unclear; README doesn't explain setup.

### Solution

Add token pool configuration section to README.

### Implementation Plan

1. Read README.md
2. Find appropriate section
3. Add token pool configuration explanation
