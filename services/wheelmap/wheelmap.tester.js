'use strict'

const serverSecrets = require('../../lib/server-secrets')
const t = (module.exports = require('../tester').createServiceTester())

const noToken = !serverSecrets.wheelmap_token
function logTokenWarning() {
  if (noToken) {
    console.warn(
      "No token provided, this test will mock Wheelmap's API responses."
    )
  }
}

t.create('node with accessibility')
  .before(logTokenWarning)
  .get('/26699541.json?style=_shields_test')
  .timeout(7500)
  .interceptIf(noToken, nock =>
    nock('https://wheelmap.org/')
      .get('/api/nodes/26699541')
      .reply(
        200,
        JSON.stringify({
          node: {
            wheelchair: 'yes',
          },
        })
      )
  )
  .expectBadge({
    label: 'accessibility',
    message: 'yes',
    color: 'brightgreen',
  })

t.create('node with limited accessibility')
  .before(logTokenWarning)
  .get('/2034868974.json?style=_shields_test')
  .timeout(7500)
  .interceptIf(noToken, nock =>
    nock('https://wheelmap.org/')
      .get('/api/nodes/2034868974')
      .reply(
        200,
        JSON.stringify({
          node: {
            wheelchair: 'limited',
          },
        })
      )
  )
  .expectBadge({
    label: 'accessibility',
    message: 'limited',
    color: 'yellow',
  })

t.create('node without accessibility')
  .before(logTokenWarning)
  .get('/-147495158.json?style=_shields_test')
  .timeout(7500)
  .interceptIf(noToken, nock =>
    nock('https://wheelmap.org/')
      .get('/api/nodes/-147495158')
      .reply(
        200,
        JSON.stringify({
          node: {
            wheelchair: 'no',
          },
        })
      )
  )
  .expectBadge({
    label: 'accessibility',
    message: 'no',
    color: 'red',
  })

t.create('node not found')
  .before(logTokenWarning)
  .get('/0.json')
  .timeout(7500)
  .interceptIf(noToken, nock =>
    nock('https://wheelmap.org/')
      .get('/api/nodes/0')
      .reply(404)
  )
  .expectBadge({
    label: 'accessibility',
    message: 'node not found',
  })
