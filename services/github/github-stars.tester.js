'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Stars')
  .get('/badges/shields.json')
  .expectBadge({
    label: 'stars',
    message: isMetric,
    link: [
      'https://github.com/badges/shields',
      'https://github.com/badges/shields/stargazers',
    ],
  })

t.create('Stars (repo not found)')
  .get('/badges/helmets.json')
  .expectBadge({
    label: 'stars',
    message: 'repo not found',
  })
