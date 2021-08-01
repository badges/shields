import { withRegex, isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isCommitsSince = withRegex(/^(commits since){1}[\s\S]+$/)

t.create('Commits since')
  .get('/badges/shields/a0663d8da53fb712472c02665e6ff7547ba945b7.json')
  .expectBadge({
    label: isCommitsSince,
    message: isMetric,
    color: 'blue',
  })

t.create('Commits since (branch)')
  .get(
    '/badges/shields/8b87fac3a1538ec20ff20983faf4b6f7e722ef87/historical.json'
  )
  .expectBadge({
    label: isCommitsSince,
    message: isMetric,
  })

t.create('Commits since by latest release')
  .get('/microsoft/typescript/latest.json')
  .expectBadge({
    label: isCommitsSince,
    message: isMetric,
  })

t.create('Commits since by latest release (branch)')
  .get('/microsoft/typescript/latest/main.json')
  .expectBadge({
    label: isCommitsSince,
    message: isMetric,
  })

t.create('Commits since by latest SemVer release')
  .get('/microsoft/typescript/latest.json?sort=semver')
  .expectBadge({
    label: isCommitsSince,
    message: isMetric,
  })

t.create('Commits since by latest pre-release')
  .get('/microsoft/typescript/latest/main.json?include_prereleases')
  .expectBadge({
    label: isCommitsSince,
    message: isMetric,
  })

t.create('Commits since (version not found)')
  .get('/badges/shields/not-a-version.json')
  .expectBadge({
    label: 'github',
    message: 'repo or version not found',
  })

t.create('Commits since (branch not found)')
  .get(
    '/badges/shields/a0663d8da53fb712472c02665e6ff7547ba945b7/not-a-branch.json'
  )
  .expectBadge({
    label: 'github',
    message: 'repo, branch or version not found',
  })
