'use strict'

const { colorScheme } = require('../test-helpers')
const serverSecrets = require('../../lib/server-secrets')

const t = (module.exports = require('../create-service-tester')())

const noToken = !serverSecrets.wheelmap_token
before(function() {
  if (noToken) {
    console.warn(
      'No Wheelmap token provided, the tests for this service will mock API responses.'
    )
  } else {
    console.info(
      'Found Wheelmap token, the tests will forward requests to the real Wheelmap service.'
    )
  }
})

t.create('node with accessibility')
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
  .expectJSON({
    name: 'accessibility',
    value: 'yes',
    colorB: colorScheme.brightgreen,
  })

t.create('node with limited accessibility')
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
  .expectJSON({
    name: 'accessibility',
    value: 'limited',
    colorB: colorScheme.yellow,
  })

t.create('node without accessibility')
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
  .expectJSON({
    name: 'accessibility',
    value: 'no',
    colorB: colorScheme.red,
  })

t.create('node not found')
  .get('/0.json')
  .timeout(7500)
  .interceptIf(noToken, nock =>
    nock('https://wheelmap.org/')
      .get('/api/nodes/0')
      .reply(404)
  )
  .expectJSON({
    name: 'accessibility',
    value: 'node not found',
  })
