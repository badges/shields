'use strict'

const { ServiceTester } = require('../tester')
const { isMetric } = require('../test-validators')

const t = new ServiceTester({
  id: 'SonarViolations',
  title: 'SonarViolations',
  pathPrefix: '/sonar',
})
module.exports = t

t.create('Violations')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/violations.json'
  )
  .expectBadge({
    label: 'violations',
    message: isMetric,
  })

t.create('Violations (legacy API supported)')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/violations.json?version=4.2'
  )
  .expectBadge({
    label: 'violations',
    message: isMetric,
  })
