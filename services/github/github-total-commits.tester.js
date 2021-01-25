'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Total Commits').get('/badges/shields.json').expectBadge({
  label: 'commits',
  message: isMetric,
})

t.create('Total Commits (Branch)')
  .get('/badges/shields/master.json')
  .expectBadge({
    label: 'commits',
    message: isMetric,
  })
