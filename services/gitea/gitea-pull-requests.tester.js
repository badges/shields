import { createServiceTester } from '../tester.js'
import {
  isMetric,
  isMetricOpenIssues,
  isMetricClosedIssues,
  isMetricWithPattern,
} from '../test-validators.js'

export const t = await createServiceTester()

t.create('Pulls (project not found)')
  .get('/open/CanisHelix/do-not-exist.json')
  .expectBadge({
    label: 'pull requests',
    message: 'user or repo not found',
  })

/**
 *  Opened pulls number case
 */
t.create('Opened pulls')
  .get(
    '/open/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({
    label: 'pull requests',
    message: isMetricOpenIssues,
  })

t.create('Open pulls raw')
  .get(
    '/open-raw/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({
    label: 'open pull requests',
    message: isMetric,
  })

t.create('Open pulls by label is > zero')
  .get(
    '/open/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=upstream',
  )
  .expectBadge({
    label: 'upstream pull requests',
    message: isMetricOpenIssues,
  })

t.create('Open pulls by multi-word label is > zero')
  .get(
    '/open/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=upstream,enhancement',
  )
  .expectBadge({
    label: 'upstream,enhancement pull requests',
    message: isMetricOpenIssues,
  })

t.create('Open pulls by label (raw)')
  .get(
    '/open-raw/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=upstream',
  )
  .expectBadge({
    label: 'open upstream pull requests',
    message: isMetric,
  })

t.create('Opened pulls by Scoped label')
  .get(
    '/open/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=failure/new',
  )
  .expectBadge({
    label: 'failure/new pull requests',
    message: isMetricOpenIssues,
  })

/**
 *  Closed pulls number case
 */
t.create('Closed pulls')
  .get(
    '/closed/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({
    label: 'pull requests',
    message: isMetricClosedIssues,
  })

t.create('Closed pulls raw')
  .get(
    '/closed-raw/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({
    label: 'closed pull requests',
    message: isMetric,
  })

t.create('Closed pulls by label is > zero')
  .get(
    '/closed/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=bug',
  )
  .expectBadge({
    label: 'bug pull requests',
    message: isMetricClosedIssues,
  })

t.create('Closed pulls by multi-word label is > zero')
  .get(
    '/closed/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=bug,good%20first%20issue',
  )
  .expectBadge({
    label: 'bug,good first issue pull requests',
    message: isMetricClosedIssues,
  })

t.create('Closed pulls by label (raw)')
  .get(
    '/closed-raw/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=bug',
  )
  .expectBadge({
    label: 'closed bug pull requests',
    message: isMetric,
  })

/**
 *  All pulls number case
 */
t.create('All pulls')
  .get('/all/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org')
  .expectBadge({
    label: 'pull requests',
    message: isMetricWithPattern(/ all/),
  })

t.create('All pulls raw')
  .get(
    '/all-raw/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({
    label: 'all pull requests',
    message: isMetric,
  })

t.create('All pulls by label is > zero')
  .get(
    '/all/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=upstream',
  )
  .expectBadge({
    label: 'upstream pull requests',
    message: isMetricWithPattern(/ all/),
  })

t.create('All pulls by multi-word label is > zero')
  .get(
    '/all/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=upstream,enhancement',
  )
  .expectBadge({
    label: 'upstream,enhancement pull requests',
    message: isMetricWithPattern(/ all/),
  })

t.create('All pulls by label (raw)')
  .get(
    '/all-raw/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&labels=upstream',
  )
  .expectBadge({
    label: 'all upstream pull requests',
    message: isMetric,
  })
