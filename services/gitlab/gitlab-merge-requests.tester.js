import Joi from 'joi'
import { createServiceTester } from '../tester.js'
import {
  isMetric,
  isMetricOpenIssues,
  isMetricClosedIssues,
} from '../test-validators.js'

export const t = await createServiceTester()

t.create('Merge Requests (project not found)')
  .get('/open/guoxudong.io/shields-test/do-not-exist.json')
  .expectBadge({
    label: 'merge requests',
    message: 'project not found',
  })

/**
 *  Opened issue number case
 */
t.create('Opened merge requests')
  .get('/open/guoxudong.io/shields-test/issue-test.json')
  .expectBadge({
    label: 'merge requests',
    message: isMetricOpenIssues,
  })

t.create('Open merge requests raw')
  .get('/open-raw/guoxudong.io/shields-test/issue-test.json')
  .expectBadge({
    label: 'open merge requests',
    message: isMetric,
  })

t.create('Open merge requests by label is > zero')
  .get('/open/guoxudong.io/shields-test/issue-test.json?labels=discussion')
  .expectBadge({
    label: 'discussion merge requests',
    message: isMetricOpenIssues,
  })

t.create('Open merge requests by  multi-word label is > zero')
  .get(
    '/open/guoxudong.io/shields-test/issue-test.json?labels=discussion,enhancement',
  )
  .expectBadge({
    label: 'discussion,enhancement merge requests',
    message: isMetricOpenIssues,
  })

t.create('Open merge requests by label (raw)')
  .get('/open-raw/guoxudong.io/shields-test/issue-test.json?labels=discussion')
  .expectBadge({
    label: 'open discussion merge requests',
    message: isMetric,
  })

t.create('Opened merge requests by Scoped labels')
  .get('/open/gitlab-org%2Fgitlab.json?labels=test,failure::new')
  .expectBadge({
    label: 'test,failure::new merge requests',
    message: Joi.alternatives(isMetricOpenIssues, Joi.equal('0 open')),
  })

/**
 *  Closed issue number case
 */
t.create('Closed merge requests')
  .get('/closed/guoxudong.io/shields-test/issue-test.json')
  .expectBadge({
    label: 'merge requests',
    message: isMetricClosedIssues,
  })

t.create('Closed merge requests raw')
  .get('/closed-raw/guoxudong.io/shields-test/issue-test.json')
  .expectBadge({
    label: 'closed merge requests',
    message: isMetric,
  })

t.create('Closed merge requests by label is > zero')
  .get('/closed/guoxudong.io/shields-test/issue-test.json?labels=bug')
  .expectBadge({
    label: 'bug merge requests',
    message: Joi.alternatives(isMetricClosedIssues, Joi.equal('0 closed')),
  })

t.create('Closed merge requests by  multi-word label is > zero')
  .get('/closed/guoxudong.io/shields-test/issue-test.json?labels=bug,critical')
  .expectBadge({
    label: 'bug,critical merge requests',
    message: Joi.alternatives(isMetricClosedIssues, Joi.equal('0 closed')),
  })

t.create('Closed merge requests by label (raw)')
  .get(
    '/closed-raw/guoxudong.io/shields-test/issue-test.json?labels=enhancement',
  )
  .expectBadge({
    label: 'closed enhancement merge requests',
    message: isMetric,
  })

/**
 *  All issue number case
 */
t.create('All merge requests')
  .get('/all/guoxudong.io/shields-test/issue-test.json')
  .expectBadge({
    label: 'merge requests',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) all$/,
    ),
  })

t.create('All merge requests raw')
  .get('/all-raw/guoxudong.io/shields-test/issue-test.json')
  .expectBadge({
    label: 'all merge requests',
    message: isMetric,
  })

t.create('All merge requests by label is > zero')
  .get('/all/guoxudong.io/shields-test/issue-test.json?labels=discussion')
  .expectBadge({
    label: 'discussion merge requests',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) all$/,
    ),
  })

t.create('All merge requests by  multi-word label is > zero')
  .get(
    '/all/guoxudong.io/shields-test/issue-test.json?labels=discussion,enhancement',
  )
  .expectBadge({
    label: 'discussion,enhancement merge requests',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) all$/,
    ),
  })

t.create('All merge requests by label (raw)')
  .get('/all-raw/guoxudong.io/shields-test/issue-test.json?labels=discussion')
  .expectBadge({
    label: 'all discussion merge requests',
    message: isMetric,
  })

t.create('more than 10k merge requests')
  .get('/all/gitlab-org%2Fgitlab.json')
  .expectBadge({
    label: 'merge requests',
    message: 'more than 10k all',
  })

t.create('locked merge requests')
  .get('/locked/gitlab-org%2Fgitlab.json')
  .expectBadge({
    label: 'merge requests',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) locked$/,
    ),
  })

t.create('Opened merge requests (self-managed)')
  .get('/open/gitlab-cn/gitlab.json?gitlab_url=https://jihulab.com')
  .expectBadge({
    label: 'merge requests',
    message: isMetricOpenIssues,
  })
