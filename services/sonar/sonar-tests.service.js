import { pathParam } from '../index.js'
import {
  testResultQueryParamSchema,
  testResultOpenApiQueryParams,
  renderTestResultBadge,
  documentation as testResultsDocumentation,
} from '../test-results.js'
import { metric as metricCount } from '../text-formatters.js'
import SonarBase from './sonar-base.js'
import {
  documentation,
  queryParamSchema,
  openApiQueryParams,
  getLabel,
} from './sonar-helpers.js'

class SonarTestsSummary extends SonarBase {
  static category = 'test-results'
  static route = {
    base: 'sonar/tests',
    pattern: ':component/:branch*',
    queryParamSchema: queryParamSchema.concat(testResultQueryParamSchema),
  }

  static openApi = {
    '/sonar/tests/{component}': {
      get: {
        summary: 'Sonar Tests',
        description: `${documentation}
          ${testResultsDocumentation}
        `,
        parameters: [
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          ...openApiQueryParams,
          ...testResultOpenApiQueryParams,
        ],
      },
    },
    '/sonar/tests/{component}/{branch}': {
      get: {
        summary: 'Sonar Tests (branch)',
        description: `${documentation}
          ${testResultsDocumentation}
        `,
        parameters: [
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          pathParam({ name: 'branch', example: 'master' }),
          ...openApiQueryParams,
          ...testResultOpenApiQueryParams,
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'tests',
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

  transform({ json, sonarVersion }) {
    const {
      tests: total,
      skipped_tests: skipped,
      test_failures: failed,
    } = super.transform({
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
    { component, branch },
    {
      server,
      sonarVersion,
      compact_message: compactMessage,
      passed_label: passedLabel,
      failed_label: failedLabel,
      skipped_label: skippedLabel,
    },
  ) {
    const json = await this.fetch({
      sonarVersion,
      server,
      component,
      branch,
      metricName: 'tests,test_failures,skipped_tests',
    })
    const { total, passed, failed, skipped } = this.transform({
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
  static category = 'build'

  static route = {
    base: 'sonar',
    pattern:
      ':metric(total_tests|skipped_tests|test_failures|test_errors|test_execution_time|test_success_density)/:component/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/sonar/{metric}/{component}': {
      get: {
        summary: 'Sonar Test Count',
        description: documentation,
        parameters: [
          pathParam({
            name: 'metric',
            example: 'total_tests',
            schema: {
              type: 'string',
              enum: [
                'total_tests',
                'skipped_tests',
                'test_failures',
                'test_errors',
              ],
            },
          }),
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          ...openApiQueryParams,
        ],
      },
    },
    '/sonar/{metric}/{component}/{branch}': {
      get: {
        summary: 'Sonar Test Count (branch)',
        description: documentation,
        parameters: [
          pathParam({
            name: 'metric',
            example: 'total_tests',
            schema: {
              type: 'string',
              enum: [
                'total_tests',
                'skipped_tests',
                'test_failures',
                'test_errors',
              ],
            },
          }),
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          pathParam({ name: 'branch', example: 'master' }),
          ...openApiQueryParams,
        ],
      },
    },
    '/sonar/test_execution_time/{component}': {
      get: {
        summary: 'Sonar Test Execution Time',
        description: documentation,
        parameters: [
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          ...openApiQueryParams,
        ],
      },
    },
    '/sonar/test_execution_time/{component}/{branch}': {
      get: {
        summary: 'Sonar Test Execution Time (branch)',
        description: documentation,
        parameters: [
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          pathParam({ name: 'branch', example: 'master' }),
          ...openApiQueryParams,
        ],
      },
    },
    '/sonar/test_success_density/{component}': {
      get: {
        summary: 'Sonar Test Success Rate',
        description: documentation,
        parameters: [
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          ...openApiQueryParams,
        ],
      },
    },
    '/sonar/test_success_density/{component}/{branch}': {
      get: {
        summary: 'Sonar Test Success Rate (branch)',
        description: documentation,
        parameters: [
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          pathParam({ name: 'branch', example: 'master' }),
          ...openApiQueryParams,
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'tests',
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

  async handle({ component, metric, branch }, { server, sonarVersion }) {
    const json = await this.fetch({
      sonarVersion,
      server,
      component,
      branch,
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

export { SonarTestsSummary, SonarTests }
