import Joi from 'joi'
import {
  isMetricOverTimePeriod,
  isZeroOverTimePeriod,
} from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isCommitActivity = Joi.alternatives().try(
  isMetricOverTimePeriod,
  isZeroOverTimePeriod
)

t.create('commit activity (1 year)').get('/y/eslint/eslint.json').expectBadge({
  label: 'commit activity',
  message: isMetricOverTimePeriod,
})

t.create('commit activity (1 month)').get('/m/eslint/eslint.json').expectBadge({
  label: 'commit activity',
  message: isMetricOverTimePeriod,
})

t.create('commit activity (4 weeks)')
  .get('/4w/eslint/eslint.json')
  .expectBadge({
    label: 'commit activity',
    message: isMetricOverTimePeriod,
  })

t.create('commit activity (1 week)').get('/w/eslint/eslint.json').expectBadge({
  label: 'commit activity',
  message: isCommitActivity,
})

t.create('commit activity (custom branch)')
  .get('/y/badges/squint/main.json')
  .expectBadge({
    label: 'commit activity',
    message: isCommitActivity,
  })

t.create('commit activity (repo not found)')
  .get('/w/badges/helmets.json')
  .expectBadge({
    label: 'commit activity',
    message: 'repo not found',
  })
