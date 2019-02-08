'use strict'

const { renderTestResultBadge } = require('../../lib/text-formatters')
const AppVeyorBase = require('./appveyor-base')

const documentation = `
<p>
  You may change the "passed", "failed" and "skipped" text on this badge by supplying query parameters <code>&passed_label=</code>, <code>&failed_label=</code> and <code>&skipped_label=</code> respectively.
  <br>
  There is also a <code>&compact_message</code> query parameter, which will default to displaying ✔, ✘ and ➟, separated by a horizontal bar |.
  <br>
  For example, if you want to use a different terminology:
  <br>
  <code>/appveyor/tests/NZSmartie/coap-net-iu0to.svg?passed_label=good&failed_label=bad&skipped_label=n%2Fa</code>
  <br>
  Or, use symbols:
  <br>
  <code>/appveyor/tests/NZSmartie/coap-net-iu0to.svg?compact_message&passed_label=%F0%9F%8E%89&failed_label=%F0%9F%92%A2&skipped_label=%F0%9F%A4%B7</code>
</p>
`

module.exports = class AppVeyorTests extends AppVeyorBase {
  static get route() {
    return {
      ...this.buildRoute('appveyor/tests'),
      queryParams: [
        'compact_message',
        'passed_label',
        'failed_label',
        'skipped_label',
      ],
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'tests',
    }
  }

  static get examples() {
    return [
      {
        title: 'AppVeyor tests',
        pattern: ':user/:repo',
        namedParams: {
          user: 'NZSmartie',
          repo: 'coap-net-iu0to',
        },
        staticPreview: {
          label: 'tests',
          message: '477 passed, 2 failed',
          color: 'red',
        },
        documentation,
      },
      {
        title: 'AppVeyor tests branch',
        pattern: ':user/:repo/:branch',
        namedParams: {
          user: 'NZSmartie',
          repo: 'coap-net-iu0to',
          branch: 'master',
        },
        staticPreview: {
          label: 'tests',
          message: '477 passed, 2 failed',
          color: 'red',
        },
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
        staticPreview: {
          label: 'tests',
          message: '✔ 477 | ✘ 2',
          color: 'red',
        },
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
        staticPreview: {
          label: 'tests',
          message: '477 good, 2 bad',
          color: 'red',
        },
        documentation,
      },
    ]
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

    if (!data.hasOwnProperty('build')) {
      return { message: 'no builds found' }
    }

    let total = 0,
      passed = 0,
      failed = 0
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
