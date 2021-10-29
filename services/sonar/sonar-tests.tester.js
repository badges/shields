import Joi from 'joi'
import { ServiceTester } from '../tester.js'
import {
  isDefaultTestTotals,
  isDefaultCompactTestTotals,
  isCustomTestTotals,
  isCustomCompactTestTotals,
  isIntegerPercentage,
  isMetric,
} from '../test-validators.js'
export const t = new ServiceTester({
  id: 'SonarTests',
  title: 'SonarTests',
  pathPrefix: '/sonar',
})
const isMetricAllowZero = Joi.alternatives(
  isMetric,
  Joi.number().valid(0).required()
)

// The service tests targeting the legacy SonarQube API are mocked
// because of the lack of publicly accessible, self-hosted, legacy SonarQube instances
// See https://github.com/badges/shields/issues/4221#issuecomment-546611598 for more details
// This is an uncommon scenario Shields has to support for Sonar, and should not be used as a model
// for other service tests.

t.create('Tests')
  .timeout(10000)
  .get(
    '/tests/swellaby:azure-pipelines-templates.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'tests',
    message: isDefaultTestTotals,
  })

t.create('Tests (branch)')
  .timeout(10000)
  .get(
    '/tests/swellaby:azure-pipelines-templates/master.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'tests',
    message: isDefaultTestTotals,
  })

t.create('Tests (legacy API supported)')
  .get(
    '/tests/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .intercept(nock =>
    nock('http://sonar.petalslink.com/api')
      .get('/resources')
      .query({
        resource: 'org.ow2.petals:petals-se-ase',
        depth: 0,
        metrics: 'tests,test_failures,skipped_tests',
        includeTrends: true,
      })
      .reply(200, [
        {
          msr: [
            {
              key: 'tests',
              val: '71',
            },
            {
              key: 'test_failures',
              val: '2',
            },
            {
              key: 'skipped_tests',
              val: '1',
            },
          ],
        },
      ])
  )
  .expectBadge({
    label: 'tests',
    message: '68 passed, 2 failed, 1 skipped',
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

t.create('Total Test Count (branch)')
  .timeout(10000)
  .get(
    '/total_tests/swellaby:azdo-shellcheck/master.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'total tests',
    message: isMetric,
  })

t.create('Total Test Count (legacy API supported)')
  .get(
    '/total_tests/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .intercept(nock =>
    nock('http://sonar.petalslink.com/api')
      .get('/resources')
      .query({
        resource: 'org.ow2.petals:petals-se-ase',
        depth: 0,
        metrics: 'tests',
        includeTrends: true,
      })
      .reply(200, [
        {
          msr: [
            {
              key: 'tests',
              val: '132',
            },
          ],
        },
      ])
  )
  .expectBadge({
    label: 'total tests',
    message: '132',
  })

t.create('Test Failures Count')
  .timeout(10000)
  .get(
    '/test_failures/swellaby:azdo-shellcheck.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'test failures',
    message: isMetricAllowZero,
  })

t.create('Test Failures Count (legacy API supported)')
  .get(
    '/test_failures/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .intercept(nock =>
    nock('http://sonar.petalslink.com/api')
      .get('/resources')
      .query({
        resource: 'org.ow2.petals:petals-se-ase',
        depth: 0,
        metrics: 'test_failures',
        includeTrends: true,
      })
      .reply(200, [
        {
          msr: [
            {
              key: 'test_failures',
              val: '2',
            },
          ],
        },
      ])
  )
  .expectBadge({
    label: 'test failures',
    message: '2',
  })

t.create('Test Errors Count')
  .timeout(10000)
  .get(
    '/test_errors/swellaby:azdo-shellcheck.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'test errors',
    message: isMetricAllowZero,
  })

t.create('Test Errors Count (legacy API supported)')
  .get(
    '/test_errors/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .intercept(nock =>
    nock('http://sonar.petalslink.com/api')
      .get('/resources')
      .query({
        resource: 'org.ow2.petals:petals-se-ase',
        depth: 0,
        metrics: 'test_errors',
        includeTrends: true,
      })
      .reply(200, [
        {
          msr: [
            {
              key: 'test_errors',
              val: '3',
            },
          ],
        },
      ])
  )
  .expectBadge({
    label: 'test errors',
    message: '3',
  })

t.create('Skipped Tests Count')
  .timeout(10000)
  .get(
    '/skipped_tests/swellaby:azdo-shellcheck.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'skipped tests',
    message: isMetricAllowZero,
  })

t.create('Skipped Tests Count (legacy API supported)')
  .get(
    '/skipped_tests/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .intercept(nock =>
    nock('http://sonar.petalslink.com/api')
      .get('/resources')
      .query({
        resource: 'org.ow2.petals:petals-se-ase',
        depth: 0,
        metrics: 'skipped_tests',
        includeTrends: true,
      })
      .reply(200, [
        {
          msr: [
            {
              key: 'skipped_tests',
              val: '1',
            },
          ],
        },
      ])
  )
  .expectBadge({
    label: 'skipped tests',
    message: '1',
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
  .get(
    '/test_success_density/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .intercept(nock =>
    nock('http://sonar.petalslink.com/api')
      .get('/resources')
      .query({
        resource: 'org.ow2.petals:petals-se-ase',
        depth: 0,
        metrics: 'test_success_density',
        includeTrends: true,
      })
      .reply(200, [
        {
          msr: [
            {
              key: 'test_success_density',
              val: '97',
            },
          ],
        },
      ])
  )
  .expectBadge({
    label: 'tests',
    message: '97%',
  })
