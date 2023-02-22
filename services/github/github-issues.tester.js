import Joi from 'joi'
import { isMetric, isMetricOpenIssues } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('GitHub closed pull requests')
  .get('/issues-pr-closed/badges/shields.json')
  .expectBadge({
    label: 'pull requests',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) closed$/
    ),
  })

t.create('GitHub closed pull requests raw')
  .get('/issues-pr-closed-raw/badges/shields.json')
  .expectBadge({
    label: 'closed pull requests',
    message: isMetric,
  })

t.create('GitHub pull requests')
  .get('/issues-pr/badges/shields.json')
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

t.create('GitHub closed issues')
  .get('/issues-closed/badges/shields.json')
  .expectBadge({
    label: 'issues',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) closed$/
    ),
  })

t.create('GitHub closed issues raw')
  .get('/issues-closed-raw/badges/shields.json')
  .expectBadge({
    label: 'closed issues',
    message: isMetric,
  })

t.create('GitHub open issues').get('/issues/badges/shields.json').expectBadge({
  label: 'issues',
  message: isMetricOpenIssues,
})

t.create('GitHub open issues raw')
  .get('/issues-raw/badges/shields.json')
  .expectBadge({ label: 'open issues', message: isMetric })

t.create('GitHub open issues by label is > zero')
  .get('/issues/badges/shields/service-badge.json')
  .expectBadge({
    label: 'service-badge issues',
    message: isMetricOpenIssues,
  })

t.create('GitHub open issues by multi-word label is > zero')
  .get('/issues/Cockatrice/Cockatrice/App%20-%20Cockatrice.json')
  .expectBadge({
    label: '"App - Cockatrice" issues',
    message: isMetricOpenIssues,
  })

t.create('GitHub open issues by label (raw)')
  .get('/issues-raw/badges/shields/service-badge.json')
  .expectBadge({
    label: 'open service-badge issues',
    message: isMetric,
  })

// https://github.com/badges/shields/issues/1870
t.create('GitHub open issues by label including slash character (raw)')
  .get('/issues-raw/calebcartwright/shields-service-test-target/@foo/bar.json')
  .expectBadge({
    label: 'open @foo/bar issues',
    // Not always > 0.
    message: Joi.alternatives(isMetric, Joi.equal('0')),
  })

t.create('GitHub open issues (repo not found)')
  .get('/issues-raw/badges/helmets.json')
  .expectBadge({
    label: 'issues',
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
