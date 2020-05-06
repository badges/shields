'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('modules by user').get('/camptocamp.json').expectBadge({
  label: 'modules',
  message: isMetric,
})

t.create('modules by user').get('/not-a-real-user.json').expectBadge({
  label: 'modules',
  message: 'not found',
})
