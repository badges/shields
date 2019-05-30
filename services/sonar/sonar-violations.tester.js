'use strict'

const Joi = require('@hapi/joi')
const { isMetric, withRegex } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())
const isViolationsLongFormMetric = Joi.alternatives(
  Joi.allow(0),
  withRegex(
    /(([\d]+) (blocker|critical|major|minor|info))(,\s([\d]+) (critical|major|minor|info))?/
  )
)

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
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/violations.json?sonarVersion=4.2'
  )
  .expectBadge({
    label: 'violations',
    message: isMetric,
  })

t.create('Violations Long Format')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/violations.json?format=long'
  )
  .expectBadge({
    label: 'violations',
    message: isViolationsLongFormMetric,
  })

t.create('Violations Long Format (legacy API supported)')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/violations.json?sonarVersion=4.2&format=long'
  )
  .expectBadge({
    label: 'violations',
    message: isViolationsLongFormMetric,
  })

t.create('Blocker Violations')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/blocker_violations.json'
  )
  .expectBadge({
    label: 'blocker violations',
    message: isMetric,
  })

t.create('Blocker Violations (legacy API supported)')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/blocker_violations.json?sonarVersion=4.2'
  )
  .expectBadge({
    label: 'blocker violations',
    message: isMetric,
  })

t.create('Critical Violations')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/critical_violations.json'
  )
  .expectBadge({
    label: 'critical violations',
    message: isMetric,
  })

t.create('Critical Violations (legacy API supported)')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/critical_violations.json?sonarVersion=4.2'
  )
  .expectBadge({
    label: 'critical violations',
    message: isMetric,
  })
