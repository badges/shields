'use strict'

const { expect } = require('chai')
const { getShieldsIcon } = require('../../lib/logos')

const t = (module.exports = require('../tester').createServiceTester())

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
    // `color` is only in _shields_test which is being specified by the
    // service, not the request. If the color key is here we know this has
    // worked.
    color: '#99c',
  })

t.create('named logo')
  .get('.svg?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/')
      .get('/badge')
      .reply(200, {
        schemaVersion: 1,
        label: 'hey',
        message: 'yo',
        namedLogo: 'npm',
      })
  )
  .after((err, res, body) => {
    expect(err).not.to.be.ok
    expect(body).to.include(getShieldsIcon({ name: 'npm' }))
  })

t.create('named logo with color')
  .get('.svg?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/')
      .get('/badge')
      .reply(200, {
        schemaVersion: 1,
        label: 'hey',
        message: 'yo',
        namedLogo: 'npm',
        logoColor: 'blue',
      })
  )
  .after((err, res, body) => {
    expect(err).not.to.be.ok
    expect(body).to.include(getShieldsIcon({ name: 'npm', color: 'blue' }))
  })

const logoSvg = Buffer.from(
  getShieldsIcon({ name: 'npm' }).replace('data:image/svg+xml;base64,', ''),
  'base64'
).toString('ascii')

t.create('custom svg logo')
  .get('.svg?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/')
      .get('/badge')
      .reply(200, {
        schemaVersion: 1,
        label: 'hey',
        message: 'yo',
        logoSvg,
      })
  )
  .after((err, res, body) => {
    expect(err).not.to.be.ok
    expect(body).to.include(getShieldsIcon({ name: 'npm' }))
  })

t.create('logoWidth')
  .get('.json?url=https://example.com/badge&style=_shields_test')
  .intercept(nock =>
    nock('https://example.com/')
      .get('/badge')
      .reply(200, {
        schemaVersion: 1,
        label: 'hey',
        message: 'yo',
        logoSvg,
        logoWidth: 30,
      })
  )
  .expectJSON({
    name: 'hey',
    value: 'yo',
    color: 'lightgrey',
    logoWidth: 30,
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
  .expectJSON({
    name: 'custom badge',
    value: 'invalid properties: schemaVersion',
  })

t.create('Invalid schema (mocked)')
  .get('.json?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/')
      .get('/badge')
      .reply(200, {
        schemaVersion: 1,
        label: 'hey',
        message: 'yo',
        extra: 'keys',
        bogus: true,
      })
  )
  .expectJSON({
    name: 'custom badge',
    value: 'invalid properties: extra, bogus',
  })

t.create('User color overrides success color')
  .get('.json?url=https://example.com/badge&color=101010&style=_shields_test')
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

t.create('User legacy color overrides success color')
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
  .get('.json?url=https://example.com/badge&color=101010&style=_shields_test')
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

t.create('User legacy color does not override error color')
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

t.create('cacheSeconds')
  .get('.json?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/')
      .get('/badge')
      .reply(200, {
        schemaVersion: 1,
        label: '',
        message: 'yo',
        cacheSeconds: 500,
      })
  )
  .expectHeader('cache-control', 'max-age=500')

t.create('user can override service cacheSeconds')
  .get('.json?url=https://example.com/badge&maxAge=1000')
  .intercept(nock =>
    nock('https://example.com/')
      .get('/badge')
      .reply(200, {
        schemaVersion: 1,
        label: '',
        message: 'yo',
        cacheSeconds: 500,
      })
  )
  .expectHeader('cache-control', 'max-age=1000')

t.create('user does not override longer service cacheSeconds')
  .get('.json?url=https://example.com/badge&maxAge=450')
  .intercept(nock =>
    nock('https://example.com/')
      .get('/badge')
      .reply(200, {
        schemaVersion: 1,
        label: '',
        message: 'yo',
        cacheSeconds: 500,
      })
  )
  .expectHeader('cache-control', 'max-age=500')

t.create('cacheSeconds does not override longer Shields default')
  .get('.json?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/')
      .get('/badge')
      .reply(200, {
        schemaVersion: 1,
        label: '',
        message: 'yo',
        cacheSeconds: 10,
      })
  )
  .expectHeader('cache-control', 'max-age=300')

t.create('Bad scheme')
  .get('.json?url=http://example.com/badge')
  .expectJSON({ name: 'custom badge', value: 'please use https' })

t.create('Blocked domain')
  .get('.json?url=https://img.shields.io/badge/foo-bar-blue.json')
  .expectJSON({ name: 'custom badge', value: 'domain is blocked' })
