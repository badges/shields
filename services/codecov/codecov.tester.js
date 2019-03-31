'use strict'

const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('gets coverage status')
  .get('/github/codecov/example-python.json')
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

t.create('handles unknown repository')
  .get('/github/codecov2/fake-not-even-a-little-bit-real-python.json')
  .expectBadge({
    label: 'coverage',
    message: 'repository not found',
  })

// Using a mocked response here because we did not have a known
// private repository hooked up with Codecov that we could use.
t.create('handles unauthorized error')
  .get('/github/codecov/private-example-python.json')
  .intercept(nock =>
    nock('https://codecov.io/api')
      .get('/github/codecov/private-example-python')
      .reply(401)
  )
  .expectBadge({
    label: 'coverage',
    message: 'not authorized to access repository',
  })

t.create('gets coverage for private repository')
  .get('/github/codecov/private-example-python.json?token=abc123def456')
  .intercept(nock =>
    nock('https://codecov.io/api', {
      reqheaders: {
        authorization: 'token abc123def456',
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
