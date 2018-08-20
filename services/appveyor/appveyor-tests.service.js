'use strict'

const AppVeyorBase = require('./appveyor-base')

module.exports = class AppVeyorTests extends AppVeyorBase {
  static get url() {
    return this.buildUrl('appveyor/tests')
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

  static render({ passed, failed, skipped, total }) {
    let message = `${passed} passed`
    if (failed > 0) {
      message += `, ${failed} failed`
    }
    if (skipped > 0) {
      message += `, ${skipped} skipped`
    }

    let color
    if (passed === total) {
      color = 'brightgreen'
    } else if (failed === 0) {
      color = 'green'
    } else if (passed === 0) {
      color = 'red'
    } else {
      color = 'orange'
    }

    return { message, color }
  }

  async handle({ repo, branch }) {
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

    return this.constructor.render({ passed, failed, skipped, total })
  }
}
