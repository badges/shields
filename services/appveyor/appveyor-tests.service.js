import {
  testResultQueryParamSchema,
  renderTestResultBadge,
} from '../test-results.js'
import AppVeyorBase from './appveyor-base.js'

const documentation = `
<p>
  You may change the "passed", "failed" and "skipped" text on this badge by supplying query parameters <code>&passed_label=</code>, <code>&failed_label=</code> and <code>&skipped_label=</code> respectively.
</p>

<p>
  For example, if you want to use a different terminology:
  <br>
  <code>/appveyor/tests/NZSmartie/coap-net-iu0to.svg?passed_label=good&failed_label=bad&skipped_label=n%2Fa</code>
</p>

<p>
  Or symbols:
  <br>
  <code>/appveyor/tests/NZSmartie/coap-net-iu0to.svg?compact_message&passed_label=%F0%9F%8E%89&failed_label=%F0%9F%92%A2&skipped_label=%F0%9F%A4%B7</code>
</p>

<p>
  There is also a <code>&compact_message</code> query parameter, which will default to displaying ✔, ✘ and ➟, separated by a horizontal bar |.
</p>
`

const commonPreviewProps = {
  passed: 477,
  failed: 2,
  skipped: 0,
  total: 479,
  isCompact: false,
}

export default class AppVeyorTests extends AppVeyorBase {
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
