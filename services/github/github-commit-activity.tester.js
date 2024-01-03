import Joi from 'joi'
import {
  isMetricOverTimePeriod,
  isZeroOverTimePeriod,
  isMetric,
} from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isCommitActivity = Joi.alternatives().try(
  isMetricOverTimePeriod,
  isZeroOverTimePeriod,
)

const authorFilterUser = 'jnullj'

t.create('commit activity (total)').get('/t/badges/shields.json').expectBadge({
  label: 'commits',
  message: isMetric,
})

t.create('commit activity (total) by author')
  .get(`/t/badges/shields.json?authorFilter=${authorFilterUser}`)
  .expectBadge({
    label: `commits by ${authorFilterUser}`,
    message: isMetric,
  })

t.create('commit activity (1 year)').get('/y/eslint/eslint.json').expectBadge({
  label: 'commit activity',
  message: isMetricOverTimePeriod,
})

t.create('commit activity (1 year) by author')
  .get(`/y/badges/shields.json?authorFilter=${authorFilterUser}`)
  .expectBadge({
    label: `commit activity by ${authorFilterUser}`,
    message: isCommitActivity,
  })

t.create('commit activity (1 month)').get('/m/eslint/eslint.json').expectBadge({
  label: 'commit activity',
  message: isMetricOverTimePeriod,
})

t.create('commit activity (1 month) by author')
  .get(`/m/badges/shields.json?authorFilter=${authorFilterUser}`)
  .expectBadge({
    label: `commit activity by ${authorFilterUser}`,
    message: isCommitActivity,
  })

t.create('commit activity (4 weeks)')
  .get('/4w/eslint/eslint.json')
  .expectBadge({
    label: 'commit activity',
    message: isMetricOverTimePeriod,
  })

t.create('commit activity (4 weeks) by author')
  .get(`/4w/badges/shields.json?authorFilter=${authorFilterUser}`)
  .expectBadge({
    label: `commit activity by ${authorFilterUser}`,
    message: isCommitActivity,
  })

t.create('commit activity (1 week)').get('/w/eslint/eslint.json').expectBadge({
  label: 'commit activity',
  message: isCommitActivity,
})

t.create('commit activity (1 week) by author')
  .get(`/w/badges/shields.json?authorFilter=${authorFilterUser}`)
  .expectBadge({
    label: `commit activity by ${authorFilterUser}`,
    message: isCommitActivity,
  })

t.create('commit activity (custom branch)')
  .get('/y/badges/squint/main.json')
  .expectBadge({
    label: 'commit activity',
    message: isCommitActivity,
  })

t.create('commit activity (custom branch) by author')
  .get(`/y/badges/squint/main.json?authorFilter=${authorFilterUser}`)
  .expectBadge({
    label: `commit activity by ${authorFilterUser}`,
    message: isCommitActivity,
  })

t.create('commit activity (repo not found)')
  .get('/w/badges/helmets.json')
  .expectBadge({
    label: 'commit activity',
    message: 'repo not found',
  })

t.create('commit activity (invalid branch)')
  .get('/w/badges/shields/invalidBranchName.json')
  .expectBadge({
    label: 'commit activity',
    message: 'invalid branch',
  })

// test for error handling of author filter as it uses REST and not GraphQL
t.create('commit activity (repo not found)')
  .get('/w/badges/helmets.json?authorFilter=zaphod')
  .expectBadge({
    label: 'commit activity',
    message: 'repo or branch not found',
  })

t.create('commit activity (invalid branch)')
  .get('/w/badges/shields/invalidBranchName.json?authorFilter=zaphod')
  .expectBadge({
    label: 'commit activity',
    message: 'repo or branch not found',
  })
