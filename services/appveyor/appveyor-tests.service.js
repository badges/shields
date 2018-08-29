'use strict'

const AppVeyorBase = require('./appveyor-base')
const { renderTestResultBadge } = require('../../lib/text-formatters')

module.exports = class AppVeyorTests extends AppVeyorBase {
  static get url() {
    return this.buildUrl('appveyor/tests', { withCompact: true })
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
        previewUrl: 'NZSmartie/coap-net-iu0to',
      },
      {
        title: 'AppVeyor tests branch',
        previewUrl: 'NZSmartie/coap-net-iu0to/master',
      },
    ]
  }

  static render({ passed, failed, skipped, total, isCompact }) {
    return renderTestResultBadge({ passed, failed, skipped, total, isCompact })
  }

  async handle({ repo, branch }, { compact_message: compactMessage }) {
    const isCompact = compactMessage !== undefined

    const {
      build: { jobs },
    } = await this.fetch({ repo, branch })

    let total = 0,
      passed = 0,
      failed = 0
    jobs.forEach(job => {
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
      isCompact,
    })
  }
}
