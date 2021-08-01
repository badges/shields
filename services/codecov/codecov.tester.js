import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets coverage status')
  .get('/github/codecov/example-python.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('gets coverage status with flag')
  .get('/github/codecov/example-node.json?flag=istanbul_mocha')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('gets coverage status for branch')
  .get('/github/codecov/example-python/master.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('gets coverage status for branch with flag')
  .get('/github/codecov/example-node/master.json?flag=istanbul_mocha')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('handles unknown repository')
  .get('/github/codecov2/fake-not-even-a-little-bit-real-python.json')
  .expectBadge({
    label: 'coverage',
    message: 'unknown',
  })

t.create('handles unknown repository with flag')
  .get(
    '/github/codecov2/fake-not-even-a-little-bit-real-node.json?flag=istanbul_mocha'
  )
  .expectBadge({
    label: 'coverage',
    message: 'unknown',
  })

t.create('gets coverage status for unknown flag')
  .get('/github/codecov/example-node.json?flag=unknown_flag')
  .expectBadge({
    label: 'coverage',
    message: 'unknown',
  })

// Using a mocked response here because we did not have a known
// private repository hooked up with Codecov that we could use.
t.create('handles unauthorized private repository')
  .get('/github/codecov/private-example-python.json')
  .intercept(nock =>
    nock('https://codecov.io')
      .get('/github/codecov/private-example-python/graph/badge.svg')
      .reply(200, `<g><text x="105.5" y="14">unknown</text></g>`, {
        'Content-Type': 'image/svg+xml',
      })
  )
  .expectBadge({
    label: 'coverage',
    message: 'unknown',
  })

t.create('handles unauthorized error (with api token)')
  .get('/github/codecov/private-example-python.json?token=a1b2c3d4e5f6g7h8')
  .intercept(nock =>
    nock('https://codecov.io/api', {
      reqheaders: {
        authorization: 'token a1b2c3d4e5f6g7h8', // lgtm [js/hardcoded-credentials]
      },
    })
      .get('/github/codecov/private-example-python')
      .reply(401)
  )
  .expectBadge({
    label: 'coverage',
    message: 'not authorized to access repository',
  })

t.create('handles unknown repository (with api token)')
  .get(
    '/github/codecov2/fake-not-even-a-little-bit-real-python.json?token=a1b2c3d4e5f6g7h8'
  )
  .intercept(nock =>
    nock('https://codecov.io/api', {
      reqheaders: {
        authorization: 'token a1b2c3d4e5f6g7h8', // lgtm [js/hardcoded-credentials]
      },
    })
      .get('/github/codecov2/fake-not-even-a-little-bit-real-python')
      .reply(404)
  )
  .expectBadge({
    label: 'coverage',
    message: 'repository not found',
  })

t.create('gets coverage for private repository')
  .get('/gh/codecov/private-example-python.json?token=a1b2c3d4e5')
  .intercept(nock =>
    nock('https://codecov.io')
      .get(
        '/gh/codecov/private-example-python/graph/badge.svg?token=a1b2c3d4e5'
      )
      .reply(200, `<g><text x="105.5" y="14">100%</text></g>`, {
        'Content-Type': 'image/svg+xml',
      })
  )
  .expectBadge({
    label: 'coverage',
    message: '100%',
  })

t.create('gets coverage for private repository (with api token)')
  .get('/github/codecov/private-example-python.json?token=a1b2c3d4e5f6g7h8')
  .intercept(nock =>
    nock('https://codecov.io/api', {
      reqheaders: {
        authorization: 'token a1b2c3d4e5f6g7h8', // lgtm [js/hardcoded-credentials]
      },
    })
      .get('/github/codecov/private-example-python')
      .reply(200, {
        commit: {
          totals: {
            c: 94.75,
          },
        },
      })
  )
  .expectBadge({
    label: 'coverage',
    message: '95%',
  })
