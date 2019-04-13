'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isIntegerPercentage } = require('../test-validators')

t.create('Coverage')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/coverage.json'
  )
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('Coverage (legacy API supported)')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/coverage.json?sonarVersion=4.2'
  )
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })
