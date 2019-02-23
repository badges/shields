'use strict'

const Joi = require('joi')
const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('gets coverage status')
  .get('/github/codecov/example-python.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'coverage',
      value: isIntegerPercentage,
    })
  )

t.create('gets coverage status for branch')
  .get('/github/codecov/example-python/master.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'coverage',
      value: isIntegerPercentage,
    })
  )

t.create('handles unknown repository')
  .get('/github/codecov2/fake-not-even-a-little-bit-real-python.json')
  .expectJSON({ name: 'coverage', value: 'repository not found' })

t.create('has correct error when token not supplied for private repository')
  .get('/gh/codecov/private-example-python.json')
  .intercept(nock =>
    nock('https://codecov.io/api')
      .get('/gh/codecov/private-example-python')
      .reply(401)
  )
  .expectJSON({
    name: 'coverage',
    value: 'token required to access private repository',
  })

t.create('gets coverage for private repository')
  .get('/gh/codecov/private-example-python.json?token=abc123def456')
  .intercept(nock =>
    nock('https://codecov.io/api')
      .get('/gh/codecov/private-example-python')
      .reply(200, {
        commit: {
          totals: {
            c: 94.75,
          },
        },
      })
  )
  .expectJSON({ name: 'coverage', value: '95%' })
