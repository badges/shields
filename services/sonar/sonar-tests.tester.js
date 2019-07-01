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
  .get('/https/sonarcloud.io/swellaby:azure-pipelines-templates/tests.json')
  .expectBadge({
    label: 'tests',
    message: isDefaultTestTotals,
  })

t.create('Tests (legacy API supported)')
  .timeout(10000)
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/tests.json?sonarVersion=4.2'
  )
  .expectBadge({
    label: 'tests',
    message: isDefaultTestTotals,
  })

t.create('Tests with compact message')
  .timeout(10000)
  .get('/https/sonarcloud.io/swellaby:azure-pipelines-templates/tests.json', {
    qs: { compact_message: null },
  })
  .expectBadge({ label: 'tests', message: isDefaultCompactTestTotals })

t.create('Tests with custom labels')
  .timeout(10000)
  .get('/https/sonarcloud.io/swellaby:azure-pipelines-templates/tests.json', {
    qs: {
      passed_label: 'good',
      failed_label: 'bad',
      skipped_label: 'n/a',
    },
  })
  .expectBadge({ label: 'tests', message: isCustomTestTotals })

t.create('Tests with compact message and custom labels')
  .timeout(10000)
  .get('/https/sonarcloud.io/swellaby:azure-pipelines-templates/tests.json', {
    qs: {
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
  .get('/https/sonarcloud.io/swellaby:azdo-shellcheck/total_tests.json')
  .expectBadge({
    label: 'total tests',
    message: isMetric,
  })

t.create('Total Test Count (legacy API supported)')
  .timeout(10000)
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/total_tests.json?sonarVersion=4.2'
  )
  .expectBadge({
    label: 'total tests',
    message: isMetric,
  })

t.create('Test Failures Count')
  .timeout(10000)
  .get('/https/sonarcloud.io/swellaby:azdo-shellcheck/test_failures.json')
  .expectBadge({
    label: 'test failures',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Test Failures Count (legacy API supported)')
  .timeout(10000)
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/test_failures.json?sonarVersion=4.2'
  )
  .expectBadge({
    label: 'test failures',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Test Errors Count')
  .timeout(10000)
  .get('/https/sonarcloud.io/swellaby:azdo-shellcheck/test_errors.json')
  .expectBadge({
    label: 'test errors',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Test Errors Count (legacy API supported)')
  .timeout(10000)
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/test_errors.json?sonarVersion=4.2'
  )
  .expectBadge({
    label: 'test errors',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Skipped Tests Count')
  .timeout(10000)
  .get('/https/sonarcloud.io/swellaby:azdo-shellcheck/skipped_tests.json')
  .expectBadge({
    label: 'skipped tests',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Skipped Tests Count (legacy API supported)')
  .timeout(10000)
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/skipped_tests.json?sonarVersion=4.2'
  )
  .expectBadge({
    label: 'skipped tests',
    message: Joi.alternatives(isMetric, 0),
  })

t.create('Test Success Rate')
  .timeout(10000)
  .get(
    '/https/sonarcloud.io/swellaby:azdo-shellcheck/test_success_density.json'
  )
  .expectBadge({
    label: 'tests',
    message: isIntegerPercentage,
  })

t.create('Test Success Rate (legacy API supported)')
  .timeout(10000)
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/test_success_density.json?sonarVersion=4.2'
  )
  .expectBadge({
    label: 'tests',
    message: isIntegerPercentage,
  })
