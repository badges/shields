'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('EssentialsX (id 9089)').get('/9089.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('Invalid Resource (id 1)').get('/1.json').expectBadge({
  label: 'downloads',
  message: 'not found',
})
