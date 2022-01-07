import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('gets the package version of zeromq')
  .get('/zeromq.json')
  .expectBadge({ label: 'conan', message: isSemver })

t.create('returns latest version')
  .intercept(nock =>
    nock('https://center.conan.io')
      .get('/v1/conans/search?q=example')
      .reply(200, {
        results: ['example/1.0@_/_', 'example/1.2@_/_', 'example/1.1@_/_'],
      })
  )
  .get('/example.json')
  .expectBadge({ label: 'conan', message: 'v1.2', color: 'blue' })

t.create('ignores mismatched package name')
  .intercept(nock =>
    nock('https://center.conan.io')
      .get('/v1/conans/search?q=example')
      .reply(200, { results: ['foo/1.0@_/_'] })
  )
  .get('/example.json')
  .expectBadge({ label: 'conan', message: 'not found', color: 'red' })

t.create('treats no results array as invalid')
  .intercept(nock =>
    nock('https://center.conan.io')
      .get('/v1/conans/search?q=example')
      .reply(200, {})
  )
  .get('/example.json')
  .expectBadge({ label: 'conan', message: 'invalid', color: 'lightgrey' })

t.create('treats empty results array as not found')
  .intercept(nock =>
    nock('https://center.conan.io')
      .get('/v1/conans/search?q=example')
      .reply(200, { results: [] })
  )
  .get('/example.json')
  .expectBadge({ label: 'conan', message: 'not found', color: 'red' })

t.create('treats unparseable version as invalid')
  .intercept(nock =>
    nock('https://center.conan.io')
      .get('/v1/conans/search?q=example')
      .reply(200, { results: ['bloop'] })
  )
  .get('/example.json')
  .expectBadge({ label: 'conan', message: 'invalid', color: 'lightgrey' })
