import Joi from 'joi'
import {
  isMetric,
  isMetricClosedIssues,
  isMetricOpenIssues,
} from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('GitHub pull requests')
  .get('/issues-pr/badges/shields.json')
  .expectBadge({
    label: 'pull requests',
    message: isMetricOpenIssues,
  })

t.create('GitHub pull requests preserve repository redirects')
  .get('/issues-pr/facebook/react.json')
  .expectBadge({
    label: 'pull requests',
    message: isMetricOpenIssues,
  })

t.create('GitHub pull requests raw')
  .get('/issues-pr-raw/badges/shields.json')
  .expectBadge({
    label: 'open pull requests',
    message: isMetric,
  })

t.create('GitHub closed pull requests')
  .get('/issues-pr-closed/badges/shields.json')
  .expectBadge({
    label: 'pull requests',
    message: isMetricClosedIssues,
  })

t.create('GitHub closed pull requests raw')
  .get('/issues-pr-closed-raw/badges/shields.json')
  .expectBadge({
    label: 'closed pull requests',
    message: isMetric,
  })

t.create('GitHub closed pull requests raw with only drafts')
  .get('/issues-pr-closed-raw/badges/shields.json?onlyDrafts')
  .expectBadge({
    label: 'closed draft pull requests',
    message: Joi.alternatives(isMetric, Joi.equal('0')),
  })

t.create('GitHub pull requests excluding drafts')
  .get('/issues-pr/badges/shields.json?excludeDrafts')
  .expectBadge({
    label: 'non-draft pull requests',
    message: isMetricOpenIssues,
  })

t.create('GitHub pull requests with only drafts')
  .get('/issues-pr/badges/shields.json?onlyDrafts')
  .expectBadge({
    label: 'draft pull requests',
    message: Joi.alternatives(isMetricOpenIssues, Joi.equal('0 open')),
  })

t.create('GitHub closed pull requests by multi-word label excluding drafts')
  .get(
    '/issues-pr-closed/badges/shields/good%20first%20issue.json?excludeDrafts',
  )
  .expectBadge({
    label: '"good first issue" non-draft pull requests',
    message: isMetricClosedIssues,
  })

t.create('GitHub pull requests with conflicting draft filters')
  .get('/issues-pr/badges/shields.json?excludeDrafts&onlyDrafts')
  .expectBadge({
    label: 'pull requests',
    message: Joi.string().pattern(/^invalid query parameter/),
  })

t.create('GitHub pull requests (repo not found)')
  .get('/issues-pr-raw/badges/helmets.json')
  .expectBadge({
    label: 'pull requests',
    message: 'repo not found',
  })

t.create('GitHub open pull requests by label')
  .get('/issues-pr/badges/shields/service-badge.json')
  .expectBadge({
    label: 'service-badge pull requests',
    message: isMetricOpenIssues,
  })

t.create('GitHub open pull requests by label (raw)')
  .get('/issues-pr-raw/badges/shields/service-badge.json')
  .expectBadge({
    label: 'open service-badge pull requests',
    message: isMetric,
  })
