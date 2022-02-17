import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('gets the package version of zeromq')
  .get('/zeromq.json')
  .expectBadge({ label: 'conan', message: isSemver })

t.create('returns latest version')
  .intercept(nock =>
    nock('https://raw.githubusercontent.com/')
      .get(`/conan-io/conan-center-index/master/recipes/example/config.yml`)
      .reply(
        200,
        `
versions:
  1.69.0:
    folder: all
  1.70.0:
    folder: all
`
      )
  )
  .get('/example.json')
  .expectBadge({ label: 'conan', message: 'v1.70.0', color: 'blue' })

t.create('treats invalid yaml as invalid')
  .intercept(nock =>
    nock('https://raw.githubusercontent.com/')
      .get(`/conan-io/conan-center-index/master/recipes/example/config.yml`)
      .reply(200, '[')
  )
  .get('/example.json')
  .expectBadge({
    label: 'conan',
    message: 'invalid config.yml',
    color: 'lightgrey',
  })

t.create('treats no results array as invalid')
  .intercept(nock =>
    nock('https://raw.githubusercontent.com/')
      .get(`/conan-io/conan-center-index/master/recipes/example/config.yml`)
      .reply(200, '')
  )
  .get('/example.json')
  .expectBadge({
    label: 'conan',
    message: 'invalid config.yml',
    color: 'lightgrey',
  })

t.create('treats 404 as not found')
  .intercept(nock =>
    nock('https://raw.githubusercontent.com/')
      .get(`/conan-io/conan-center-index/master/recipes/example/config.yml`)
      .reply(404)
  )
  .get('/example.json')
  .expectBadge({
    label: 'conan',
    message:
      'repo not found, branch not found, or recipes/example/config.yml missing',
    color: 'red',
  })

t.create('treats empty results array as not found')
  .intercept(nock =>
    nock('https://raw.githubusercontent.com/')
      .get(`/conan-io/conan-center-index/master/recipes/example/config.yml`)
      .reply(200, 'versions: []')
  )
  .get('/example.json')
  .expectBadge({ label: 'conan', message: 'no versions found', color: 'red' })
