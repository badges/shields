import { createServiceTester } from '../tester.js'
import {
  isMetric,
  isMetricOpenIssues,
  isMetricClosedIssues,
  isMetricWithPattern,
} from '../test-validators.js'

export const t = await createServiceTester()

t.create('Issues (project not found)')
  .get('/open/CanisHelix/do-not-exist.json')
  .expectBadge({
    label: 'issues',
    message: 'user or repo not found',
  })

/**
 *  Opened issue number case
 */
t.create('Opened issues')
  .get(
    '/open/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({
    label: 'issues',
    message: isMetricOpenIssues,
  })

t.create('Open issues raw')
  .get(
    '/open-raw/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({
    label: 'open issues',
    message: isMetric,
  })

t.create('Open issues by label is > zero')
  .get(
    '/open/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=question',
  )
  .expectBadge({
    label: 'question issues',
    message: isMetricOpenIssues,
  })

t.create('Open issues by multi-word label is > zero')
  .get(
    '/open/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=question,enhancement',
  )
  .expectBadge({
    label: 'question,enhancement issues',
    message: isMetricOpenIssues,
  })

t.create('Open issues by label (raw)')
  .get(
    '/open-raw/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=question',
  )
  .expectBadge({
    label: 'open question issues',
    message: isMetric,
  })

t.create('Opened issues by Scoped labels')
  .get(
    '/open/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=question,enhancement/new',
  )
  .expectBadge({
    label: 'question,enhancement/new issues',
    message: isMetricOpenIssues,
  })

/**
 *  Closed issue number case
 */
t.create('Closed issues')
  .get(
    '/closed/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({
    label: 'issues',
    message: isMetricClosedIssues,
  })

t.create('Closed issues raw')
  .get(
    '/closed-raw/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({
    label: 'closed issues',
    message: isMetric,
  })

t.create('Closed issues by label is > zero')
  .get(
    '/closed/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=bug',
  )
  .expectBadge({
    label: 'bug issues',
    message: isMetricClosedIssues,
  })

t.create('Closed issues by multi-word label is > zero')
  .get(
    '/closed/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=bug,good%20first%20issue',
  )
  .expectBadge({
    label: 'bug,good first issue issues',
    message: isMetricClosedIssues,
  })

t.create('Closed issues by label (raw)')
  .get(
    '/closed-raw/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=bug',
  )
  .expectBadge({
    label: 'closed bug issues',
    message: isMetric,
  })

/**
 *  All issue number case
 */
t.create('All issues')
  .get('/all/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org')
  .expectBadge({
    label: 'issues',
    message: isMetricWithPattern(/ all/),
  })

t.create('All issues raw')
  .get(
    '/all-raw/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({
    label: 'all issues',
    message: isMetric,
  })

t.create('All issues by label is > zero')
  .get(
    '/all/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=question',
  )
  .expectBadge({
    label: 'question issues',
    message: isMetricWithPattern(/ all/),
  })

t.create('All issues by multi-word label is > zero')
  .get(
    '/all/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=question,enhancement',
  )
  .expectBadge({
    label: 'question,enhancement issues',
    message: isMetricWithPattern(/ all/),
  })

t.create('All issues by label (raw)')
  .get(
    '/all-raw/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=question',
  )
  .expectBadge({
    label: 'all question issues',
    message: isMetric,
  })
