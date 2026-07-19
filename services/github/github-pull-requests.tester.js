import Joi from 'joi'
import { isMetric, isMetricOpenIssues } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

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

t.create('GitHub closed pull requests')
  .get('/issues-pr-closed/badges/shields.json')
  .expectBadge({
    label: 'pull requests',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) closed$/,
    ),
  })

t.create('GitHub closed pull requests raw')
  .get('/issues-pr-closed-raw/badges/shields.json')
  .expectBadge({
    label: 'closed pull requests',
    message: isMetric,
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
