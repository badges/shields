import Joi from 'joi'
import { createServiceTester } from '../tester.js'
import {
  isMetric,
  isMetricOpenIssues,
  isMetricClosedIssues,
} from '../test-validators.js'

export const t = await createServiceTester()

t.create('Issues (project not found)')
  .get('/open/guoxudong.io/shields-test/do-not-exist.json')
  .expectBadge({
    label: 'issues',
    message: 'project not found',
  })

/**
 *  Opened issue number case
 */
t.create('Opened issues')
  .get('/open/guoxudong.io/shields-test/issue-test.json')
  .expectBadge({
    label: 'issues',
    message: isMetricOpenIssues,
  })

t.create('Open issues raw')
  .get('/open-raw/guoxudong.io/shields-test/issue-test.json')
  .expectBadge({
    label: 'open issues',
    message: isMetric,
  })

t.create('Open issues by label is > zero')
  .get('/open/guoxudong.io/shields-test/issue-test.json?labels=discussion')
  .expectBadge({
    label: 'discussion issues',
    message: isMetricOpenIssues,
  })

t.create('Open issues by  multi-word label is > zero')
  .get(
    '/open/guoxudong.io/shields-test/issue-test.json?labels=discussion,enhancement',
  )
  .expectBadge({
    label: 'discussion,enhancement issues',
    message: isMetricOpenIssues,
  })

t.create('Open issues by label (raw)')
  .get('/open-raw/guoxudong.io/shields-test/issue-test.json?labels=discussion')
  .expectBadge({
    label: 'open discussion issues',
    message: isMetric,
  })

t.create('Opened issues by Scoped labels')
  .get('/open/gitlab-org%2Fgitlab.json?labels=test,failure::new')
  .expectBadge({
    label: 'test,failure::new issues',
    message: isMetricOpenIssues,
  })

/**
 *  Closed issue number case
 */
t.create('Closed issues')
  .get('/closed/guoxudong.io/shields-test/issue-test.json')
  .expectBadge({
    label: 'issues',
    message: isMetricClosedIssues,
  })

t.create('Closed issues raw')
  .get('/closed-raw/guoxudong.io/shields-test/issue-test.json')
  .expectBadge({
    label: 'closed issues',
    message: isMetric,
  })

t.create('Closed issues by label is > zero')
  .get('/closed/guoxudong.io/shields-test/issue-test.json?labels=bug')
  .expectBadge({
    label: 'bug issues',
    message: isMetricClosedIssues,
  })

t.create('Closed issues by  multi-word label is > zero')
  .get('/closed/guoxudong.io/shields-test/issue-test.json?labels=bug,critical')
  .expectBadge({
    label: 'bug,critical issues',
    message: isMetricClosedIssues,
  })

t.create('Closed issues by label (raw)')
  .get('/closed-raw/guoxudong.io/shields-test/issue-test.json?labels=bug')
  .expectBadge({
    label: 'closed bug issues',
    message: isMetric,
  })

/**
 *  All issue number case
 */
t.create('All issues')
  .get('/all/guoxudong.io/shields-test/issue-test.json')
  .expectBadge({
    label: 'issues',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) all$/,
    ),
  })

t.create('All issues raw')
  .get('/all-raw/guoxudong.io/shields-test/issue-test.json')
  .expectBadge({
    label: 'all issues',
    message: isMetric,
  })

t.create('All issues by label is > zero')
  .get('/all/guoxudong.io/shields-test/issue-test.json?labels=discussion')
  .expectBadge({
    label: 'discussion issues',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) all$/,
    ),
  })

t.create('All issues by  multi-word label is > zero')
  .get(
    '/all/guoxudong.io/shields-test/issue-test.json?labels=discussion,enhancement',
  )
  .expectBadge({
    label: 'discussion,enhancement issues',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) all$/,
    ),
  })

t.create('All issues by label (raw)')
  .get('/all-raw/guoxudong.io/shields-test/issue-test.json?labels=discussion')
  .expectBadge({
    label: 'all discussion issues',
    message: isMetric,
  })
