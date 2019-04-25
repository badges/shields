'use strict'

const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Documented API Density')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/public_documented_api_density.json'
  )
  .expectBadge({
    label: 'public documented api density',
    message: isIntegerPercentage,
  })

t.create('Documented API Density (legacy API supported)')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/public_documented_api_density.json?sonarVersion=4.2'
  )
  .expectBadge({
    label: 'public documented api density',
    message: isIntegerPercentage,
  })
