import {
  testResultQueryParamSchema,
  testResultOpenApiQueryParams,
  renderTestResultBadge,
  documentation as description,
} from '../test-results.js'
import { pathParams } from '../index.js'
import AppVeyorBase from './appveyor-base.js'

export default class AppVeyorTests extends AppVeyorBase {
  static category = 'test-results'
  static route = {
    ...this.buildRoute('appveyor/tests'),
    queryParamSchema: testResultQueryParamSchema,
  }

  static openApi = {
    '/appveyor/tests/{user}/{repo}': {
      get: {
        summary: 'AppVeyor tests',
        description,
        parameters: [
          ...pathParams(
            { name: 'user', example: 'NZSmartie' },
            { name: 'repo', example: 'coap-net-iu0to' },
          ),
          ...testResultOpenApiQueryParams,
        ],
      },
    },
    '/appveyor/tests/{user}/{repo}/{branch}': {
      get: {
        summary: 'AppVeyor tests (with branch)',
        description,
        parameters: [
          ...pathParams(
            { name: 'user', example: 'NZSmartie' },
            { name: 'repo', example: 'coap-net-iu0to' },
            { name: 'branch', example: 'master' },
          ),
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

  async handle(
    { user, repo, branch },
    {
      compact_message: compactMessage,
      passed_label: passedLabel,
      failed_label: failedLabel,
      skipped_label: skippedLabel,
    },
  ) {
    const isCompact = compactMessage !== undefined
    const data = await this.fetch({ user, repo, branch })

    if (!('build' in data)) {
      return { message: 'no builds found' }
    }

    let total = 0
    let passed = 0
    let failed = 0
    data.build.jobs.forEach(job => {
      total += job.testsCount
      passed += job.passedTestsCount
      failed += job.failedTestsCount
    })
    const skipped = total - passed - failed

    return this.constructor.render({
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
}
