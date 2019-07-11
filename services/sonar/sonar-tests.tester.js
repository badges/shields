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
    '/swellaby:azure-pipelines-templates/tests.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'tests',
    message: isDefaultTestTotals,
  })

t.create('Tests (legacy API supported)')
  .timeout(10000)
  .get(
    '/org.ow2.petals%3Apetals-se-ase/tests.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .expectBadge({
    label: 'tests',
    message: isDefaultTestTotals,
  })

t.create('Tests with compact message')
  .timeout(10000)
  .get('/swellaby:azure-pipelines-templates/tests.json', {
    qs: {
      compact_message: null,
      server: 'https://sonarcloud.io',
    },
  })
  .expectBadge({ label: 'tests', message: isDefaultCompactTestTotals })

t.create('Tests with custom labels')
  .timeout(10000)
  .get('/swellaby:azure-pipelines-templates/tests.json', {
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
  .get('/swellaby:azure-pipelines-templates/tests.json', {
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
    '/swellaby:azdo-shellcheck/total_tests.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'total tests',
    message: isMetric,
  })

t.create('Total Test Count (legacy API supported)')
  .timeout(10000)
  .get(
    '/org.ow2.petals%3Apetals-se-ase/total_tests.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .expectBadge({
    label: 'total tests',
    message: isMetric,
  })

t.create('Test Failures Count')
  .timeout(10000)
  .get(
    '/swellaby:azdo-shellcheck/test_failures.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'test failures',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Test Failures Count (legacy API supported)')
  .timeout(10000)
  .get(
    '/org.ow2.petals%3Apetals-se-ase/test_failures.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .expectBadge({
    label: 'test failures',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Test Errors Count')
  .timeout(10000)
  .get(
    '/swellaby:azdo-shellcheck/test_errors.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'test errors',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Test Errors Count (legacy API supported)')
  .timeout(10000)
  .get(
    '/org.ow2.petals%3Apetals-se-ase/test_errors.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .expectBadge({
    label: 'test errors',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Skipped Tests Count')
  .timeout(10000)
  .get(
    '/swellaby:azdo-shellcheck/skipped_tests.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'skipped tests',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Skipped Tests Count (legacy API supported)')
  .timeout(10000)
  .get(
    '/org.ow2.petals%3Apetals-se-ase/skipped_tests.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .expectBadge({
    label: 'skipped tests',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Test Success Rate')
  .timeout(10000)
  .get(
    '/swellaby:azdo-shellcheck/test_success_density.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'tests',
    message: isIntegerPercentage,
  })

t.create('Test Success Rate (legacy API supported)')
  .timeout(10000)
  .get(
    '/org.ow2.petals%3Apetals-se-ase/test_success_density.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .expectBadge({
    label: 'tests',
    message: isIntegerPercentage,
  })
