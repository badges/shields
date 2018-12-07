'use strict'

const t = (module.exports = require('../create-service-tester')())

t.create('Valid schema (mocked)')
  .get('.json?url=https://example.com/badge')
  .only()
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

t.create('Bad scheme')
  .get('.json?url=http://example.com/badge')
  .expectJSON({ name: 'custom badge', value: 'please use https' })

t.create('Blocked domain')
  .get('.json?url=https://img.shields.io/badge/foo-bar-blue.json')
  .expectJSON({ name: 'custom badge', value: 'domain is blocked' })
