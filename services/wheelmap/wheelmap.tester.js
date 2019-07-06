'use strict'

const serverSecrets = require('../../lib/server-secrets')
const t = (module.exports = require('../tester').createServiceTester())

const noToken = !serverSecrets.wheelmap_token
function logTokenWarning() {
  // TODO: For some reason this warning message isn't printing.
  if (noToken) {
    console.warn('No token provided. Wheelmap tests will be skipped.')
  }
}

t.create('node with accessibility')
  .before(logTokenWarning)
  .skipIf(noToken)
  .get('/26699541.json')
  .timeout(7500)
  .expectBadge({
    label: 'accessibility',
    message: 'yes',
    color: 'brightgreen',
  })

t.create('node with limited accessibility')
  .before(logTokenWarning)
  .skipIf(noToken)
  .get('/2034868974.json')
  .timeout(7500)
  .expectBadge({
    label: 'accessibility',
    message: 'limited',
    color: 'yellow',
  })

t.create('node without accessibility')
  .before(logTokenWarning)
  .skipIf(noToken)
  .get('/-147495158.json')
  .timeout(7500)
  .expectBadge({
    label: 'accessibility',
    message: 'no',
    color: 'red',
  })

t.create('node not found')
  .before(logTokenWarning)
  .skipIf(noToken)
  .get('/0.json')
  .timeout(7500)
  .expectBadge({
    label: 'accessibility',
    message: 'node not found',
  })
