'use strict'

const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Tech Debt')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/tech_debt.json'
  )
  .expectBadge({
    label: 'tech debt',
    message: isIntegerPercentage,
  })

t.create('Tech Debt (legacy API supported)')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/tech_debt.json?sonarVersion=4.2'
  )
  .expectBadge({
    label: 'tech debt',
    message: isIntegerPercentage,
  })
