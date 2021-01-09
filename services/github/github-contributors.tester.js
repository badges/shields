'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isMetric } = require('../test-validators')

t.create('Contributors')
  .get('/contributors/badges/shields.json')
  .expectBadge({
    label: 'contributors',
    message: isMetric,
    link: [
      `https://github.com/badges/shields`,
      `https://github.com/badges/shields/graphs/contributors`,
    ],
  })

t.create('1 contributor')
  .get('/contributors/badges/shields-tests.json')
  .expectBadge({
    label: 'contributors',
    message: '1',
    link: [
      `https://github.com/badges/shields-tests`,
      `https://github.com/badges/shields-tests/graphs/contributors`,
    ],
  })

t.create('Contributors (repo not found)')
  .get('/contributors/badges/helmets.json')
  .expectBadge({
    label: 'contributors',
    message: 'repo not found',
  })
