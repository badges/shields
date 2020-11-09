'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { withRegex, isMetric } = require('../test-validators')

const isVersionLabel = withRegex(/^downloads@(\d+\.\d+\.\d+)(\.\d+)?$/)

t.create('downloads invalid extension')
  .get('/dt/badges/shields.json')
  .expectBadge({
    label: 'downloads',
    message: 'extension not found',
  })

t.create('downloads').get('/dt/redhat/java.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('downloads version').get('/dt/redhat/java/latest.json').expectBadge({
  label: isVersionLabel,
  message: isMetric,
})
