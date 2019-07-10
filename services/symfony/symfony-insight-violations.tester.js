'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { withRegex } = require('../test-validators')
const { sampleProjectUuid, checkShouldSkip } = require('./symfony-test-helpers')

t.create('valid project violations')
  .skipWhen(checkShouldSkip)
  .get(`/${sampleProjectUuid}.json`)
  .timeout(15000)
  .expectBadge({
    label: 'violations',
    message: withRegex(
      /\d* critical|\d* critical, \d* major|\d* critical, \d* major, \d* minor|\d* critical, \d* major, \d* minor, \d* info|\d* critical, \d* minor|\d* critical, \d* info|\d* major|\d* major, \d* minor|\d* major, \d* minor, \d* info|\d* major, \d* info|\d* minor|\d* minor, \d* info/
    ),
  })
