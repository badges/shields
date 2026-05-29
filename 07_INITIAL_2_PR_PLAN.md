# 07_INITIAL_2_PR_PLAN.md — Shields Initial 2 PR Plan

## Initial PR Selection

| # | Candidate ID | Title | Risk | Size | Rationale |
| --- | --- | --- | --- | --- | --- |
| 1 | S-01 | docs: fix broken link to tutorial on contributing.shields.io | LOW | ~10 | Issue #4139, clear fix |
| 2 | S-07 | docs: add troubleshooting section for common service badge failures | LOW | ~80 | Audit finding, clear value to contributors |

**Why not other candidates:**

- S-02, S-03, S-06, S-09: require more investigation of upstream API behavior
- S-04, S-10: docs improvements but less urgent than S-07
- S-05: touches core rendering, MED risk
- S-08: vague "metadata validation" — not clearly defined

---

## PR #1 (Initial): S-01 — docs: fix broken link to tutorial on contributing.shields.io

**Branch:** `contrib/shields/docs-fix-broken-link` **Linked Issue:** #4139 **Target Files:** doc/, CONTRIBUTING.md, or relevant docs

### Why This Is An Initial PR

- Issue-backed — link is confirmed broken
- Trivial fix — just remove or update the reference
- Low effort, clear value

### Implementation Plan

1. `git checkout main && git pull upstream main`
2. `git checkout -b contrib/shields/docs-fix-broken-link`
3. Search for `contributing.shields.io` in codebase
4. Fix or remove the broken link

### Test Plan

- Verify no other references to broken URL exist
- Check the fixed link (if replacing) resolves correctly

### Risk

- **LOW** — docs only

---

## PR #2 (Initial): S-07 — docs: add troubleshooting section for common service badge failures

**Branch:** `contrib/shields/docs-troubleshooting` **Linked Issue:** none **Source:** quality audit **Target Files:** CONTRIBUTING.md

### Why This Is An Initial PR

- Clear value for contributors — reduces support load
- No behavior change — pure documentation
- Easy to review — straightforward writeup

### Implementation Plan

1. `git checkout main && git pull upstream main`
2. `git checkout -b contrib/shields/docs-troubleshooting`
3. Read existing CONTRIBUTING.md structure
4. Add troubleshooting section covering:
   - Upstream API timeout handling
   - Token pool exhaustion resolution
   - Common badge rendering failures
   - How to run service-specific tests

### Test Plan

- Proof-read for accuracy
- Verify formatting matches rest of CONTRIBUTING.md

### Risk

- **LOW** — docs only

---

## Branch Queue

| Candidate ID | Branch | Title | Tests Run | Risk | Ready For PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| S-01 | contrib/shields/docs-fix-broken-link | docs: fix broken link | NA (docs) | LOW | NO | Must implement |
| S-07 | contrib/shields/docs-troubleshooting | docs: add troubleshooting section | NA (docs) | LOW | NO | Must implement |

---

## Remaining 3 PRs (not yet opened)

| PR # | Candidate ID | Title | Status |
| --- | --- | --- | --- |
| 3 | S-04 | docs: add note about required environment variables for local dev | Planned |
| 4 | S-08 | chore: add package metadata validation for badge services | Planned |
| 5 | S-10 | docs: clarify token pool configuration in README | Planned |
