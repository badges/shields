'use strict'

const { ServiceTester } = require('../tester')
const { isIntegerPercentage } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'codecov',
  title: 'Codecov.io',
}))

t.create('gets coverage status')
  .get('/c/github/codecov/example-python.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('gets coverate status for branch')
  .get('/c/github/codecov/example-python/master.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })
