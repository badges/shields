'use strict'

const getURL = '/https/example.com/example.json.json?style=_shields_test'
const apiURL = 'http://online.swagger.io'
const apiGetURL = '/validator/debug'
const apiGetQueryParams = { url: 'https://example.com/example.json' }

const t = (module.exports = require('../tester').createServiceTester())

t.create('Valid (mocked)')
  .get(getURL)
  .intercept(nock =>
    nock(apiURL)
      .get(apiGetURL)
      .query(apiGetQueryParams)
      .reply(200, {})
  )
  .expectBadge({
    label: 'swagger',
    message: 'valid',
    color: 'brightgreen',
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
  .expectBadge({
    label: 'swagger',
    message: 'invalid',
    color: 'red',
  })
