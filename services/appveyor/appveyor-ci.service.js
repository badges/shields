'use strict'

const AppVeyorBase = require('./appveyor-base')

module.exports = class AppVeyorCi extends AppVeyorBase {
  static get url() {
    return this.buildUrl('appveyor/ci')
  }

  static get examples() {
    return [
      {
        title: 'AppVeyor',
        exampleUrl: 'gruntjs/grunt',
        urlPattern: ':user/:repo',
        staticExample: this.render({ status: 'success' }),
      },
      {
        title: 'AppVeyor branch',
        exampleUrl: 'gruntjs/grunt/master',
        urlPattern: ':user/:repo/:branch',
        staticExample: this.render({ status: 'success' }),
      },
    ]
  }

  static render({ status }) {
    if (status === 'success') {
      return { message: 'passing', color: 'brightgreen' }
    } else if (status !== 'running' && status !== 'queued') {
      return { message: 'failing', color: 'red' }
    } else {
      return { message: status }
    }
  }

  async handle({ repo, branch }) {
    const {
      build: { status },
    } = await this.fetch({ repo, branch })
    return this.constructor.render({ status })
  }
}
