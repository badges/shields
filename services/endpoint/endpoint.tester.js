import zlib from 'zlib'
import { expect } from 'chai'
import { getShieldsIcon } from '../../lib/logos.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Valid schema')
  .get('.json?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/').get('/badge').reply(200, {
      schemaVersion: 1,
      label: '',
      message: 'yo',
    })
  )
  .expectBadge({ label: '', message: 'yo' })

t.create('color and labelColor')
  .get('.json?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/').get('/badge').reply(200, {
      schemaVersion: 1,
      label: 'hey',
      message: 'yo',
      color: '#f0dcc3',
      labelColor: '#e6e6fa',
    })
  )
  .expectBadge({
    label: 'hey',
    message: 'yo',
    color: '#f0dcc3',
    labelColor: '#e6e6fa',
  })

t.create('style')
  .get('.json?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/').get('/badge').reply(200, {
      schemaVersion: 1,
      label: 'hey',
      message: 'yo',
      color: '#99c',
    })
  )
  .expectBadge({
    label: 'hey',
    message: 'yo',
    // `color` is being specified by the service, not the request.
    // If the color key is here we know this has worked.
    color: '#99c',
  })

t.create('named logo')
  .get('.svg?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/').get('/badge').reply(200, {
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
    nock('https://example.com/').get('/badge').reply(200, {
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
    nock('https://example.com/').get('/badge').reply(200, {
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
  .get('.json?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/').get('/badge').reply(200, {
      schemaVersion: 1,
      label: 'hey',
      message: 'yo',
      logoSvg,
      logoWidth: 30,
    })
  )
  .expectBadge({
    label: 'hey',
    message: 'yo',
    logoWidth: 30,
  })

t.create('Invalid schema')
  .get('.json?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/').get('/badge').reply(200, {
      schemaVersion: -1,
    })
  )
  .expectBadge({
    label: 'custom badge',
    message: 'invalid properties: schemaVersion, label, message',
  })

t.create('Invalid schema')
  .get('.json?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/').get('/badge').reply(200, {
      schemaVersion: 1,
      label: 'hey',
      message: 'yo',
      extra: 'keys',
      bogus: true,
    })
  )
  .expectBadge({
    label: 'custom badge',
    message: 'invalid properties: extra, bogus',
  })

t.create('User color overrides success color')
  .get('.json?url=https://example.com/badge&color=101010')
  .intercept(nock =>
    nock('https://example.com/').get('/badge').reply(200, {
      schemaVersion: 1,
      label: '',
      message: 'yo',
      color: 'blue',
    })
  )
  .expectBadge({ label: '', message: 'yo', color: '#101010' })

t.create('User legacy color overrides success color')
  .get('.json?url=https://example.com/badge&colorB=101010')
  .intercept(nock =>
    nock('https://example.com/').get('/badge').reply(200, {
      schemaVersion: 1,
      label: '',
      message: 'yo',
      color: 'blue',
    })
  )
  .expectBadge({ label: '', message: 'yo', color: '#101010' })

t.create('User color does not override error color')
  .get('.json?url=https://example.com/badge&color=101010')
  .intercept(nock =>
    nock('https://example.com/').get('/badge').reply(200, {
      schemaVersion: 1,
      isError: true,
      label: 'something is',
      message: 'not right',
      color: 'red',
    })
  )
  .expectBadge({ label: 'something is', message: 'not right', color: 'red' })

t.create('User legacy color does not override error color')
  .get('.json?url=https://example.com/badge&colorB=101010')
  .intercept(nock =>
    nock('https://example.com/').get('/badge').reply(200, {
      schemaVersion: 1,
      isError: true,
      label: 'something is',
      message: 'not right',
      color: 'red',
    })
  )
  .expectBadge({ label: 'something is', message: 'not right', color: 'red' })

t.create('cacheSeconds')
  .get('.json?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/').get('/badge').reply(200, {
      schemaVersion: 1,
      label: '',
      message: 'yo',
      cacheSeconds: 500,
    })
  )
  .expectHeader('cache-control', 'max-age=500, s-maxage=500')

t.create('user can override service cacheSeconds')
  .get('.json?url=https://example.com/badge&cacheSeconds=1000')
  .intercept(nock =>
    nock('https://example.com/').get('/badge').reply(200, {
      schemaVersion: 1,
      label: '',
      message: 'yo',
      cacheSeconds: 500,
    })
  )
  .expectHeader('cache-control', 'max-age=1000, s-maxage=1000')

t.create('user does not override longer service cacheSeconds')
  .get('.json?url=https://example.com/badge&cacheSeconds=450')
  .intercept(nock =>
    nock('https://example.com/').get('/badge').reply(200, {
      schemaVersion: 1,
      label: '',
      message: 'yo',
      cacheSeconds: 500,
    })
  )
  .expectHeader('cache-control', 'max-age=500, s-maxage=500')

t.create('cacheSeconds does not override longer Shields default')
  .get('.json?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/').get('/badge').reply(200, {
      schemaVersion: 1,
      label: '',
      message: 'yo',
      cacheSeconds: 10,
    })
  )
  .expectHeader('cache-control', 'max-age=300, s-maxage=300')

t.create('Bad scheme')
  .get('.json?url=http://example.com/badge')
  .expectBadge({ label: 'custom badge', message: 'please use https' })

t.create('Blocked domain')
  .get('.json?url=https://img.shields.io/badge/foo-bar-blue.json')
  .expectBadge({ label: 'custom badge', message: 'domain is blocked' })

// https://github.com/badges/shields/issues/3780
t.create('Invalid url (1)').get('.json?url=https:/').expectBadge({
  label: 'custom badge',
  message: 'invalid query parameter: url',
})

t.create('Invalid url (2)')
  .get('.json?url=https%3A//shields.io%foo')
  .expectBadge({
    label: 'custom badge',
    message: 'invalid url',
  })

// https://github.com/badges/shields/issues/5868
t.create('gzipped endpoint')
  .get('.json?url=https://example.com/badge')
  .intercept(nock =>
    nock('https://example.com/')
      .get('/badge')
      .reply(
        200,
        zlib.gzipSync(
          JSON.stringify({ schemaVersion: 1, label: '', message: 'yo' })
        ),
        { 'Content-Encoding': 'gzip' }
      )
  )
  .expectBadge({ label: '', message: 'yo' })
