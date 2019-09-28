'use strict'

const Joi = require('@hapi/joi')
const { isMetric, isMetricOverTimePeriod } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

const downloadsToday = Joi.alternatives(
  isMetricOverTimePeriod,
  Joi.allow('0/today')
)
const downloadsThisWeek = Joi.alternatives(
  isMetricOverTimePeriod,
  Joi.allow('0/today')
)
const downloadsThisMonth = Joi.alternatives(
  isMetricOverTimePeriod,
  Joi.allow('0/today')
)
const downloadsThisYear = Joi.alternatives(
  isMetricOverTimePeriod,
  Joi.allow('0/today')
)

t.create('Package Registry Downloads (non-existent repository')
  .get('/badges/not-a-real-repo/total/super-fake-package.json')
  .expectBadge({
    label: 'downloads',
    message: 'repo not found',
  })

t.create('Package Registry Downloads (non-existent package')
  .get('/badges/shields/total/super-fake-package.json')
  .expectBadge({
    label: 'downloads',
    message: 'package not found',
  })

t.create('Package Registry Downloads (non-existent version')
  .get('/github/semantic/total/semantic/9.9.9.json')
  .expectBadge({
    label: 'downloads',
    message: 'version not found',
  })

t.create('Package Registry Downloads (total)')
  .get('/github/semantic/total/semantic.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('Package Registry Downloads (today)')
  .get('/github/semantic/today/semantic.json')
  .expectBadge({
    label: 'downloads',
    message: downloadsToday,
  })

t.create('Package Registry Downloads (this week)')
  .get('/github/semantic/week/semantic.json')
  .expectBadge({
    label: 'downloads',
    message: downloadsThisWeek,
  })

t.create('Package Registry Downloads (this month)')
  .get('/github/semantic/month/semantic.json')
  .expectBadge({
    label: 'downloads',
    message: downloadsThisMonth,
  })

t.create('Package Registry Downloads (this year)')
  .get('/github/semantic/year/semantic.json')
  .expectBadge({
    label: 'downloads',
    message: downloadsThisYear,
  })

t.create('Package Registry Downloads (specific version total)')
  .get('/github/auto-complete-element/total/auto-complete-element/1.0.6.json')
  .expectBadge({
    label: 'downloads@1.0.6',
    message: isMetric,
  })

t.create('Package Registry Downloads (specific version today)')
  .get('/github/auto-complete-element/today/auto-complete-element/1.0.6.json')
  .expectBadge({
    label: 'downloads@1.0.6',
    message: downloadsToday,
  })

t.create('Package Registry Downloads (specific version this week)')
  .get('/github/auto-complete-element/week/auto-complete-element/1.0.6.json')
  .expectBadge({
    label: 'downloads@1.0.6',
    message: downloadsThisWeek,
  })

t.create('Package Registry Downloads (specific version this month)')
  .get('/github/auto-complete-element/month/auto-complete-element/1.0.6.json')
  .expectBadge({
    label: 'downloads@1.0.6',
    message: downloadsThisMonth,
  })

t.create('Package Registry Downloads (specific version this year)')
  .get('/github/auto-complete-element/year/auto-complete-element/1.0.6.json')
  .expectBadge({
    label: 'downloads@1.0.6',
    message: downloadsThisYear,
  })

t.create('Package Registry Downloads (latest version total)')
  .get('/github/auto-complete-element/total/auto-complete-element/latest.json')
  .expectBadge({
    label: 'downloads@latest',
    message: isMetric,
  })

t.create('Package Registry Downloads (latest version today)')
  .get('/github/auto-complete-element/today/auto-complete-element/latest.json')
  .expectBadge({
    label: 'downloads@latest',
    message: downloadsToday,
  })

t.create('Package Registry Downloads (latest version this week)')
  .get('/github/auto-complete-element/week/auto-complete-element/latest.json')
  .expectBadge({
    label: 'downloads@latest',
    message: downloadsThisWeek,
  })

t.create('Package Registry Downloads (latest version this month)')
  .get('/github/auto-complete-element/month/auto-complete-element/latest.json')
  .expectBadge({
    label: 'downloads@latest',
    message: downloadsThisMonth,
  })

t.create('Package Registry Downloads (latest version this year)')
  .get('/github/auto-complete-element/year/auto-complete-element/latest.json')
  .expectBadge({
    label: 'downloads@latest',
    message: downloadsThisYear,
  })
