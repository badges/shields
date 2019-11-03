'use strict'

const getURL = '/spec.json?url=https://example.com/example.json'
const apiURL = 'http://validator.swagger.io'
const apiGetURL = '/validator/debug'
const apiGetQueryParams = {
  url: 'https://example.com/example.json',
}

const t = (module.exports = require('../tester').createServiceTester())

t.create('Valid')
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

t.create('Valid with Warnings')
  .get(getURL)
  .intercept(nock =>
    nock(apiURL)
      .get(apiGetURL)
      .query(apiGetQueryParams)
      .reply(200, {
        schemaValidationMessages: [
          {
            level: 'warning',
            message: 'warning',
          },
        ],
      })
  )
  .expectBadge({
    label: 'swagger',
    message: 'valid',
    color: 'brightgreen',
  })

t.create('Invalid')
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

t.create('Not found')
  .get(getURL)
  .intercept(nock =>
    nock(apiURL)
      .get(apiGetURL)
      .query(apiGetQueryParams)
      .reply(200, {
        schemaValidationMessages: [
          {
            level: 'error',
            message: "Can't read from file https://example.com/example.json",
          },
        ],
      })
  )
  .expectBadge({
    label: 'swagger',
    message: 'spec not found',
    color: 'red',
  })
