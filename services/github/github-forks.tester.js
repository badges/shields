'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Forks')
  .get('/badges/shields.json')
  .expectBadge({
    label: 'forks',
    message: isMetric,
  })

t.create('Forks (repo not found)')
  .get('/badges/helmets.json')
  .expectBadge({
    label: 'forks',
    message: 'repo not found',
  })
