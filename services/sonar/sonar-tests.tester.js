'use strict'

const Joi = require('@hapi/joi')
const { ServiceTester } = require('../tester')
const t = (module.exports = new ServiceTester({
  id: 'SonarTests',
  title: 'SonarTests',
  pathPrefix: '/sonar',
}))
const {
  isDefaultTestTotals,
  isDefaultCompactTestTotals,
  isCustomTestTotals,
  isCustomCompactTestTotals,
} = require('../test-validators')
const { isIntegerPercentage, isMetric } = require('../test-validators')

t.create('Tests')
  .timeout(10000)
  .get(
    '/tests/swellaby:azure-pipelines-templates.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'tests',
    message: isDefaultTestTotals,
  })

t.create('Tests (legacy API supported)')
  .timeout(10000)
  .get(
    '/tests/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .expectBadge({
    label: 'tests',
    message: isDefaultTestTotals,
  })

t.create('Tests with compact message')
  .timeout(10000)
  .get('/tests/swellaby:azure-pipelines-templates.json', {
    qs: {
      compact_message: null,
      server: 'https://sonarcloud.io',
    },
  })
  .expectBadge({ label: 'tests', message: isDefaultCompactTestTotals })

t.create('Tests with custom labels')
  .timeout(10000)
  .get('/tests/swellaby:azure-pipelines-templates.json', {
    qs: {
      server: 'https://sonarcloud.io',
      passed_label: 'good',
      failed_label: 'bad',
      skipped_label: 'n/a',
    },
  })
  .expectBadge({ label: 'tests', message: isCustomTestTotals })

t.create('Tests with compact message and custom labels')
  .timeout(10000)
  .get('/tests/swellaby:azure-pipelines-templates.json', {
    qs: {
      server: 'https://sonarcloud.io',
      compact_message: null,
      passed_label: '💃',
      failed_label: '🤦‍♀️',
      skipped_label: '🤷',
    },
  })
  .expectBadge({
    label: 'tests',
    message: isCustomCompactTestTotals,
  })

t.create('Total Test Count')
  .timeout(10000)
  .get(
    '/total_tests/swellaby:azdo-shellcheck.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'total tests',
    message: isMetric,
  })

t.create('Total Test Count (legacy API supported)')
  .timeout(10000)
  .get(
    '/total_tests/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .expectBadge({
    label: 'total tests',
    message: isMetric,
  })

t.create('Test Failures Count')
  .timeout(10000)
  .get(
    '/test_failures/swellaby:azdo-shellcheck.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'test failures',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Test Failures Count (legacy API supported)')
  .timeout(10000)
  .get(
    '/test_failures/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .expectBadge({
    label: 'test failures',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Test Errors Count')
  .timeout(10000)
  .get(
    '/test_errors/swellaby:azdo-shellcheck.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'test errors',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Test Errors Count (legacy API supported)')
  .timeout(10000)
  .get(
    '/test_errors/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .expectBadge({
    label: 'test errors',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Skipped Tests Count')
  .timeout(10000)
  .get(
    '/skipped_tests/swellaby:azdo-shellcheck.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'skipped tests',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Skipped Tests Count (legacy API supported)')
  .timeout(10000)
  .get(
    '/skipped_tests/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .expectBadge({
    label: 'skipped tests',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Test Success Rate')
  .timeout(10000)
  .get(
    '/test_success_density/swellaby:azdo-shellcheck.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'tests',
    message: isIntegerPercentage,
  })

t.create('Test Success Rate (legacy API supported)')
  .timeout(10000)
  .get(
    '/test_success_density/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .expectBadge({
    label: 'tests',
    message: isIntegerPercentage,
  })
