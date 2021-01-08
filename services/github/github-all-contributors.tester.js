'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isMetric } = require('../test-validators')

t.create('all-contributors repo')
  .get('/all-contributors/all-contributors.json')
  .expectBadge({
    label: 'all contributors',
    message: isMetric,
    link: [
      `https://github.com/all-contributors/all-contributors`,
      `https://github.com/all-contributors/all-contributors/graphs/contributors`,
    ],
  })

t.create('shields repo (not found)').get('/badges/shields.json').expectBadge({
  label: 'all contributors',
  message: 'repo not found, branch not found, or .all-contributorsrc missing',
})
