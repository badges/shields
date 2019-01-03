'use strict'

const { colorScheme } = require('../test-helpers')

const getURL = '/https/example.com/example.json.json?style=_shields_test'
const apiURL = 'http://online.swagger.io'
const apiGetURL = '/validator/debug'
const apiGetQueryParams = { url: 'https://example.com/example.json' }

const t = (module.exports = require('../create-service-tester')())

t.create('Valid (mocked)')
  .get(getURL)
  .intercept(nock =>
    nock(apiURL)
      .get(apiGetURL)
      .query(apiGetQueryParams)
      .reply(200, {})
  )
  .expectJSON({
    name: 'swagger',
    value: 'valid',
    colorB: colorScheme.brightgreen,
  })

t.create('Invalid (mocked)')
  .get(getURL)
  .intercept(nock =>
    nock(apiURL)
      .get(apiGetURL)
      .query(apiGetQueryParams)
      .reply(200, {
        schemaValidationMessages: [
          {
            level: 'error',
            message: 'error',
          },
        ],
      })
  )
  .expectJSON({
    name: 'swagger',
    value: 'invalid',
    colorB: colorScheme.red,
  })

module.exports = t
