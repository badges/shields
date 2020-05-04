'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Followers').get('/webcaetano.json').expectBadge({
  label: 'followers',
  message: isMetric,
})

t.create('Followers (user not found)').get('/PyvesB2.json').expectBadge({
  label: 'followers',
  message: 'user not found',
})
