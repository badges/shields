'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { noToken } = require('../test-helpers')
const noWheelmapToken = noToken(require('./wheelmap.service'))

t.create('node with accessibility')
  .skipWhen(noWheelmapToken)
  .get('/26699541.json')
  .timeout(7500)
  .expectBadge({
    label: 'accessibility',
    message: 'yes',
    color: 'brightgreen',
  })

t.create('node with limited accessibility')
  .skipWhen(noWheelmapToken)
  .get('/2034868974.json')
  .timeout(7500)
  .expectBadge({
    label: 'accessibility',
    message: 'limited',
    color: 'yellow',
  })

t.create('node without accessibility')
  .skipWhen(noWheelmapToken)
  .get('/-147495158.json')
  .timeout(7500)
  .expectBadge({
    label: 'accessibility',
    message: 'no',
    color: 'red',
  })

t.create('node not found')
  .skipWhen(noWheelmapToken)
  .get('/0.json')
  .timeout(7500)
  .expectBadge({
    label: 'accessibility',
    message: 'node not found',
  })
