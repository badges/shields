'use strict'

const t = (module.exports = require('../create-service-tester')())

t.create('Valid schema (mocked)')
  .get('.json?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/')
      .get('/badge')
      .reply(200, {
        schemaVersion: 1,
        label: '',
        message: 'yo',
      })
  )
  .expectJSON({ name: '', value: 'yo' })

t.create('color and labelColor')
  .get('.json?url=https://example.com/badge&style=_shields_test')
  .intercept(nock =>
    nock('https://example.com/')
      .get('/badge')
      .reply(200, {
        schemaVersion: 1,
        label: 'hey',
        message: 'yo',
        color: '#f0dcc3',
        labelColor: '#e6e6fa',
      })
  )
  .expectJSON({
    name: 'hey',
    value: 'yo',
    color: '#f0dcc3',
    labelColor: '#e6e6fa',
  })

t.create('style')
  .get('.json?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/')
      .get('/badge')
      .reply(200, {
        schemaVersion: 1,
        label: 'hey',
        message: 'yo',
        color: '#99c',
        style: '_shields_test',
      })
  )
  .expectJSON({
    name: 'hey',
    value: 'yo',
    // color is only in _shields_test which is being specified by the service.
    color: '#99c',
  })

t.create('Invalid schema (mocked)')
  .get('.json?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/')
      .get('/badge')
      .reply(200, {
        schemaVersion: -1,
      })
  )
  .expectJSON({ name: 'custom badge', value: 'invalid response data' })

t.create('User color overrides success color')
  .get('.json?url=https://example.com/badge&colorB=101010&style=_shields_test')
  .intercept(nock =>
    nock('https://example.com/')
      .get('/badge')
      .reply(200, {
        schemaVersion: 1,
        label: '',
        message: 'yo',
        color: 'blue',
      })
  )
  .expectJSON({ name: '', value: 'yo', color: '#101010' })

t.create('User color does not override error color')
  .get('.json?url=https://example.com/badge&colorB=101010&style=_shields_test')
  .intercept(nock =>
    nock('https://example.com/')
      .get('/badge')
      .reply(200, {
        schemaVersion: 1,
        isError: true,
        label: 'something is',
        message: 'not right',
        color: 'red',
      })
  )
  .expectJSON({ name: 'something is', value: 'not right', color: 'red' })

t.create('Bad scheme')
  .get('.json?url=http://example.com/badge')
  .expectJSON({ name: 'custom badge', value: 'please use https' })

t.create('Blocked domain')
  .get('.json?url=https://img.shields.io/badge/foo-bar-blue.json')
  .expectJSON({ name: 'custom badge', value: 'domain is blocked' })
