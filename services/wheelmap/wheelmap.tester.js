'use strict'

const config = require('config').util.toObject()
const t = (module.exports = require('../tester').createServiceTester())

function checkShouldSkip() {
  const noToken = !config.private.wheelmap_token
  if (noToken) {
    console.warn(
      'No Wheelmap token configured. Service tests will be skipped. Add a token in local.yml to run these tests.'
    )
  }
  return noToken
}

t.create('node with accessibility')
  .skipWhen(checkShouldSkip)
  .get('/26699541.json')
  .timeout(7500)
  .expectBadge({
    label: 'accessibility',
    message: 'yes',
    color: 'brightgreen',
  })

t.create('node with limited accessibility')
  .skipWhen(checkShouldSkip)
  .get('/2034868974.json')
  .timeout(7500)
  .expectBadge({
    label: 'accessibility',
    message: 'limited',
    color: 'yellow',
  })

t.create('node without accessibility')
  .skipWhen(checkShouldSkip)
  .get('/-147495158.json')
  .timeout(7500)
  .expectBadge({
    label: 'accessibility',
    message: 'no',
    color: 'red',
  })

t.create('node not found')
  .skipWhen(checkShouldSkip)
  .get('/0.json')
  .timeout(7500)
  .expectBadge({
    label: 'accessibility',
    message: 'node not found',
  })
