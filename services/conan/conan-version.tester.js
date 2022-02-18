import config from 'config'
import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('gets the package version of zeromq')
  .get('/zeromq.json')
  .expectBadge({ label: 'conan', message: isSemver })

const hasGithubToken = !!config.util.toObject().private.gh_token
function mockConfig(nock, status, body) {
  if (hasGithubToken) {
    return nock('https://api.github.com/')
      .get(
        `/repos/conan-io/conan-center-index/contents/recipes/example/config.yml?ref=master`
      )
      .reply(
        status,
        body === undefined
          ? undefined
          : {
              content: Buffer.from(body).toString('base64'),
              encoding: 'base64',
            }
      )
  } else {
    return nock('https://raw.githubusercontent.com/')
      .get(`/conan-io/conan-center-index/master/recipes/example/config.yml`)
      .reply(status, body)
  }
}

t.create('returns latest version')
  .intercept(nock =>
    mockConfig(
      nock,
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
  .intercept(nock => mockConfig(nock, 200, '['))
  .get('/example.json')
  .expectBadge({
    label: 'conan',
    message: 'invalid config.yml',
    color: 'lightgrey',
  })

t.create('treats no results array as invalid')
  .intercept(nock => mockConfig(nock, 200, ' '))
  .get('/example.json')
  .expectBadge({
    label: 'conan',
    message: 'invalid config.yml',
    color: 'lightgrey',
  })

t.create('treats 404 as not found')
  .intercept(nock => mockConfig(nock, 404))
  .get('/example.json')
  .expectBadge({
    label: 'conan',
    message:
      'repo not found, branch not found, or recipes/example/config.yml missing',
    color: 'red',
  })

t.create('treats empty results array as not found')
  .intercept(nock => mockConfig(nock, 200, 'versions: []'))
  .get('/example.json')
  .expectBadge({ label: 'conan', message: 'no versions found', color: 'red' })
