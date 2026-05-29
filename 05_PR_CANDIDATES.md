# 05_PR_CANDIDATES.md — Shields PR Candidates

## Candidate List

| ID | Title | Type | Linked Issue | Source | Risk | Size | Merge | Selected |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S-01 | docs: fix broken link to tutorial on contributing.shields.io | docs | #4139 | issue | LOW | ~10 | HIGH |  |
| S-02 | test: add test for npm package badge with non-latin alphabets | test | #6989 | issue | LOW | ~80 | MED |  |
| S-03 | fix: handle large GitHub releases with better caching | fix | #672 | issue | MED | ~120 | MED |  |
| S-04 | docs: add note about required environment variables for local dev | docs | none | audit | LOW | ~50 | HIGH |  |
| S-05 | fix: validate Content-Type header before rendering SVG | fix | #4258 | issue | MED | ~60 | MED |  |
| S-06 | test: add test for GitHub file size badge on large files | test | #10548 | issue | LOW | ~60 | MED |  |
| S-07 | docs: add troubleshooting section for common service badge failures | docs | none | audit | LOW | ~80 | HIGH |  |
| S-08 | chore: add package metadata validation for badge services | chore | none | audit | LOW | ~40 | HIGH |  |
| S-09 | fix: handle npm total statistic edge case for scoped packages | fix | #1278 | issue | LOW | ~40 | MED |  |
| S-10 | docs: clarify token pool configuration in README | docs | none | audit | LOW | ~30 | HIGH |  |

---

## S-01: docs: fix broken link to tutorial on contributing.shields.io

- **Linked Issue:** #4139
- **Source:** issue triage — reported broken link
- **Problem:** Link to tutorial on `contributing.shields.io/index.html` is broken
- **Proposed Solution:** Find and fix the broken link in the relevant docs/pages
- **Target Files:** doc/, README.md, or other docs files
- **Test Plan:** Verify link resolves correctly
- **Risk:** LOW — docs only
- **Expected Diff:** ~10 lines
- **Merge Likelihood:** HIGH — trivial fix
- **Selected:** YES

---

## S-02: test: add test for npm package badge with non-latin alphabets

- **Linked Issue:** #6989
- **Source:** issue triage
- **Problem:** npm package badge doesn't render non-latin alphabets correctly
- **Proposed Solution:** Add test case that verifies non-latin package names are handled correctly in npm badge service
- **Target Files:** `services/npm/`, tests for npm badge
- **Test Plan:** Run npm service tests
- **Risk:** LOW — test only
- **Expected Diff:** ~80 lines
- **Merge Likelihood:** MED
- **Selected:** NO

---

## S-03: fix: handle large GitHub releases with better caching

- **Linked Issue:** #672
- **Source:** issue triage — old issue about large release handling
- **Problem:** GitHub releases with many assets cause issues; suggestion to use caching
- **Proposed Solution:** Implement better caching for large release listing
- **Target Files:** `services/github/` release-related code
- **Test Plan:** Test with large release
- **Risk:** MED — touches GitHub service code
- **Expected Diff:** ~120 lines
- **Merge Likelihood:** MED
- **Selected:** NO

---

## S-04: docs: add note about required environment variables for local dev

- **Linked Issue:** none
- **Source:** audit — local dev may fail without certain env vars
- **Problem:** Developers may not know which environment variables are required for local development
- **Proposed Solution:** Add a section in CONTRIBUTING.md or README about required env vars (NODE_ENV, tokens, etc.)
- **Target Files:** CONTRIBUTING.md, README.md
- **Test Plan:** Read and verify clarity
- **Risk:** LOW — docs only
- **Expected Diff:** ~50 lines
- **Merge Likelihood:** HIGH
- **Selected:** NO

---

## S-05: fix: validate Content-Type header before rendering SVG

- **Linked Issue:** #4258
- **Source:** issue triage
- **Problem:** ValidationError: "x-ratelimit-limit" is required — badge service failing due to missing header validation
- **Proposed Solution:** Add proper Content-Type header validation before SVG rendering
- **Target Files:** `core/` badge rendering code
- **Test Plan:** Run core tests
- **Risk:** MED — touches core rendering
- **Expected Diff:** ~60 lines
- **Merge Likelihood:** MED
- **Selected:** NO

---

## S-06: test: add test for GitHub file size badge on large files

- **Linked Issue:** #10548
- **Source:** issue triage
- **Problem:** GitHub file size badge doesn't work for some files
- **Proposed Solution:** Add test for large file size badge rendering
- **Target Files:** `services/github/` file size related tests
- **Test Plan:** Run GitHub service tests
- **Risk:** LOW — test only
- **Expected Diff:** ~60 lines
- **Merge Likelihood:** MED
- **Selected:** NO

---

## S-07: docs: add troubleshooting section for common service badge failures

- **Linked Issue:** none
- **Source:** audit
- **Problem:** Contributors hit common failures with service badges (upstream API issues, token problems) with no troubleshooting help
- **Proposed Solution:** Add troubleshooting section to CONTRIBUTING.md for common badge failures
- **Target Files:** CONTRIBUTING.md
- **Test Plan:** Read and verify
- **Risk:** LOW — docs only
- **Expected Diff:** ~80 lines
- **Merge Likelihood:** HIGH
- **Selected:** NO

---

## S-08: chore: add package metadata validation for badge services

- **Linked Issue:** none
- **Source:** audit
- **Problem:** Badge services may be missing required metadata; no validation exists
- **Proposed Solution:** Add schema validation for badge service package metadata
- **Target Files:** `core/` or base service class
- **Test Plan:** Run core tests
- **Risk:** LOW — tooling only
- **Expected Diff:** ~40 lines
- **Merge Likelihood:** HIGH
- **Selected:** NO

---

## S-09: fix: handle npm total statistic edge case for scoped packages

- **Linked Issue:** #1278
- **Source:** issue triage — old issue
- **Problem:** npm total statistic is wrong for scoped packages
- **Proposed Solution:** Fix scoped package download count handling
- **Target Files:** `services/npm/`
- **Test Plan:** Run npm tests with scoped package
- **Risk:** LOW — small fix
- **Expected Diff:** ~40 lines
- **Merge Likelihood:** MED
- **Selected:** NO

---

## S-10: docs: clarify token pool configuration in README

- **Linked Issue:** none
- **Source:** audit
- **Problem:** Token pool configuration is unclear; README doesn't explain setup
- **Proposed Solution:** Add token pool configuration section to README
- **Target Files:** README.md
- **Test Plan:** Read and verify
- **Risk:** LOW
- **Expected Diff:** ~30 lines
- **Merge Likelihood:** HIGH
- **Selected:** NO
