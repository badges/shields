'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('hit counter')
  .get('/badges/shields/async%20handle.json')
  .expectBadge({ label: 'async handle counter', message: isMetric })

t.create('hit counter for nonexistent repo')
  .get('/badges/puppets/async%20handle.json')
  .expectBadge({ label: 'counter', message: 'repo not found' })
