'use strict'

const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Tech Debt')
  .get(
    '/tech_debt/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com'
  )
  .expectBadge({
    label: 'tech debt',
    message: isIntegerPercentage,
  })

t.create('Tech Debt (legacy API supported)')
  .get(
    '/tech_debt/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .expectBadge({
    label: 'tech debt',
    message: isIntegerPercentage,
  })
