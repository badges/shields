import {
  testResultQueryParamSchema,
  renderTestResultBadge,
  documentation as testResultsDocumentation,
} from '../test-results.js'
import { metric as metricCount } from '../text-formatters.js'
import SonarBase from './sonar-base.js'
import {
  documentation,
  keywords,
  queryParamSchema,
  getLabel,
} from './sonar-helpers.js'

class SonarTestsSummary extends SonarBase {
  static category = 'test-results'
  static route = {
    base: 'sonar/tests',
    pattern: ':component/:branch*',
    queryParamSchema: queryParamSchema.concat(testResultQueryParamSchema),
  }

  static examples = [
    {
      title: 'Sonar Tests',
      namedParams: {
        component: 'org.ow2.petals:petals-se-ase',
        branch: 'master',
      },
      queryParams: {
        server: 'http://sonar.petalslink.com',
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
    }
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

  static examples = [
    {
      title: 'Sonar Test Count',
      pattern:
        ':metric(total_tests|skipped_tests|test_failures|test_errors)/:component/:branch*',
      namedParams: {
        component: 'org.ow2.petals:petals-log',
        metric: 'total_tests',
        branch: 'master',
      },
      queryParams: {
        server: 'http://sonar.petalslink.com',
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
      pattern: 'test_execution_time/:component/:branch*',
      namedParams: {
        component: 'swellaby:azure-pipelines-templates',
        branch: 'master',
      },
      queryParams: {
        server: 'https://sonarcloud.io',
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
      pattern: 'test_success_density/:component/:branch*',
      namedParams: {
        component: 'swellaby:azure-pipelines-templates',
        branch: 'master',
      },
      queryParams: {
        server: 'https://sonarcloud.io',
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
