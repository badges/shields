'use strict'

const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Documented API Density')
  .get(
    '/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com'
  )
  .expectBadge({
    label: 'public documented api density',
    message: isIntegerPercentage,
  })

t.create('Documented API Density (legacy API supported)')
  .get(
    '/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .expectBadge({
    label: 'public documented api density',
    message: isIntegerPercentage,
  })
