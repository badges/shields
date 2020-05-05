'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('releases by user').get('/camptocamp.json').expectBadge({
  label: 'releases',
  message: isMetric,
})

t.create('releases by user').get('/not-a-real-user.json').expectBadge({
  label: 'releases',
  message: 'not found',
})
