'use strict'

const {
  testResultQueryParamSchema,
  renderTestResultBadge,
  documentation: testResultsDocumentation,
} = require('../test-results')
const { metric: metricCount } = require('../text-formatters')
const SonarBase = require('./sonar-base')
const {
  documentation,
  keywords,
  patternBase,
  queryParamSchema,
  getLabel,
} = require('./sonar-helpers')

class SonarTestsSummary extends SonarBase {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'sonar',
      pattern: `${patternBase}/tests`,
      queryParamSchema: queryParamSchema.concat(testResultQueryParamSchema),
    }
  }

  static get examples() {
    return [
      {
        title: 'Sonar Tests',
        namedParams: {
          protocol: 'http',
          host: 'sonar.petalslink.com',
          component: 'org.ow2.petals:petals-se-ase',
        },
        queryParams: {
          sonarVersion: '4.2',
          compact_message: null,
          passed_label: 'passed',
          failed_label: 'failed',
          skipped_label: 'skipped',
        },
        staticPreview: this.render({
          passed: 5,
          failed: 1,
          skipped: 0,
          total: 6,
          isCompact: false,
        }),
        keywords,
        documentation: `
          ${documentation}
          ${testResultsDocumentation}
        `,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'tests',
    }
  }

  static render({
    passed,
    failed,
    skipped,
    total,
    passedLabel,
    failedLabel,
    skippedLabel,
    isCompact,
  }) {
    return renderTestResultBadge({
      passed,
      failed,
      skipped,
      total,
      passedLabel,
      failedLabel,
      skippedLabel,
      isCompact,
    })
  }

  transformTestResults({ json, sonarVersion }) {
    const {
      tests: total,
      skipped_tests: skipped,
      test_failures: failed,
    } = this.transform({
      json,
      sonarVersion,
    })

    return {
      total,
      passed: total - (skipped + failed),
      failed,
      skipped,
    }
  }

  async handle(
    { protocol, host, component },
    {
      sonarVersion,
      compact_message: compactMessage,
      passed_label: passedLabel,
      failed_label: failedLabel,
      skipped_label: skippedLabel,
    }
  ) {
    const json = await this.fetch({
      sonarVersion,
      protocol,
      host,
      component,
      metricName: 'tests,test_failures,skipped_tests',
    })
    const { total, passed, failed, skipped } = this.transformTestResults({
      json,
      sonarVersion,
    })
    return this.constructor.render({
      passed,
      failed,
      skipped,
      total,
      isCompact: compactMessage !== undefined,
      passedLabel,
      failedLabel,
      skippedLabel,
    })
  }
}

class SonarTests extends SonarBase {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'sonar',
      pattern: `${patternBase}/:metric(total_tests|skipped_tests|test_failures|test_errors|test_execution_time|test_success_density)`,
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Sonar Test Count',
        pattern: `${patternBase}/:metric(total_tests|skipped_tests|test_failures|test_errors)`,
        namedParams: {
          protocol: 'http',
          host: 'sonar.petalslink.com',
          component: 'org.ow2.petals:petals-log',
          metric: 'total_tests',
        },
        queryParams: {
          sonarVersion: '4.2',
        },
        staticPreview: this.render({
          metric: 'total_tests',
          value: 131,
        }),
        keywords,
        documentation,
      },
      {
        title: 'Sonar Test Execution Time',
        pattern: `${patternBase}/test_execution_time`,
        namedParams: {
          protocol: 'https',
          host: 'sonarcloud.io',
          component: 'swellaby:azure-pipelines-templates',
        },
        queryParams: {
          sonarVersion: '4.2',
        },
        staticPreview: this.render({
          metric: 'test_execution_time',
          value: 2,
        }),
        keywords,
        documentation,
      },
      {
        title: 'Sonar Test Success Rate',
        pattern: `${patternBase}/test_success_density`,
        namedParams: {
          protocol: 'https',
          host: 'sonarcloud.io',
          component: 'swellaby:azure-pipelines-templates',
        },
        queryParams: {
          sonarVersion: '4.2',
        },
        staticPreview: this.render({
          metric: 'test_success_density',
          value: 100,
        }),
        keywords,
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'tests',
    }
  }

  static render({ value, metric }) {
    let color = 'blue'
    let label = getLabel({ metric })
    let message = metricCount(value)

    if (metric === 'test_failures' || metric === 'test_errors') {
      color = value === 0 ? 'brightgreen' : 'red'
    } else if (metric === 'test_success_density') {
      color = value === 100 ? 'brightgreen' : 'red'
      label = 'tests'
      message = `${value}%`
    }

    return {
      label,
      message,
      color,
    }
  }

  async handle({ protocol, host, component, metric }, { sonarVersion }) {
    const json = await this.fetch({
      sonarVersion,
      protocol,
      host,
      component,
      // We're using 'tests' as the metric key to provide our standard
      // formatted test badge (passed, failed, skipped) that exists for other
      // services. Therefore, we're exposing 'total_tests' to the user, and
      // need to map that to the 'tests' metric which sonar uses to represent the
      // total number of tests.
      // https://docs.sonarqube.org/latest/user-guide/metric-definitions/
      metricName: metric === 'total_tests' ? 'tests' : metric,
    })
    const metrics = this.transform({ json, sonarVersion })
    return this.constructor.render({
      value: metrics[metric === 'total_tests' ? 'tests' : metric],
      metric,
    })
  }
}

module.exports = [SonarTestsSummary, SonarTests]
