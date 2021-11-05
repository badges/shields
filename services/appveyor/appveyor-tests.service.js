import {
  testResultQueryParamSchema,
  renderTestResultBadge,
  documentation,
} from '../test-results.js'
import AppVeyorBase from './appveyor-base.js'

const commonPreviewProps = {
  passed: 477,
  failed: 2,
  skipped: 0,
  total: 479,
  isCompact: false,
}

export default class AppVeyorTests extends AppVeyorBase {
  static category = 'test-results'
  static route = {
    ...this.buildRoute('appveyor/tests'),
    queryParamSchema: testResultQueryParamSchema,
  }

  static examples = [
    {
      title: 'AppVeyor tests',
      pattern: ':user/:repo',
      namedParams: {
        user: 'NZSmartie',
        repo: 'coap-net-iu0to',
      },
      staticPreview: this.render(commonPreviewProps),
      documentation,
    },
    {
      title: 'AppVeyor tests (branch)',
      pattern: ':user/:repo/:branch',
      namedParams: {
        user: 'NZSmartie',
        repo: 'coap-net-iu0to',
        branch: 'master',
      },
      staticPreview: this.render(commonPreviewProps),
      documentation,
    },
    {
      title: 'AppVeyor tests (compact)',
      pattern: ':user/:repo',
      namedParams: {
        user: 'NZSmartie',
        repo: 'coap-net-iu0to',
      },
      queryParams: { compact_message: null },
      staticPreview: this.render({
        ...commonPreviewProps,
        isCompact: true,
      }),
      documentation,
    },
    {
      title: 'AppVeyor tests with custom labels',
      pattern: ':user/:repo',
      namedParams: {
        user: 'NZSmartie',
        repo: 'coap-net-iu0to',
      },
      queryParams: {
        passed_label: 'good',
        failed_label: 'bad',
        skipped_label: 'n/a',
      },
      staticPreview: this.render({
        ...commonPreviewProps,
        passedLabel: 'good',
        failedLabel: 'bad',
        skippedLabel: 'n/a',
      }),
      documentation,
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

  async handle(
    { user, repo, branch },
    {
      compact_message: compactMessage,
      passed_label: passedLabel,
      failed_label: failedLabel,
      skipped_label: skippedLabel,
    }
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
