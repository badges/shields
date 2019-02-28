'use strict'

const { renderBuildStatusBadge } = require('../build-status')
const AppVeyorBase = require('./appveyor-base')

module.exports = class AppVeyorCi extends AppVeyorBase {
  static get route() {
    return this.buildRoute('appveyor/ci')
  }

  static get examples() {
    return [
      {
        title: 'AppVeyor',
        pattern: ':user/:repo',
        namedParams: { user: 'gruntjs', repo: 'grunt' },
        staticPreview: this.render({ status: 'success' }),
      },
      {
        title: 'AppVeyor branch',
        pattern: ':user/:repo/:branch',
        namedParams: { user: 'gruntjs', repo: 'grunt', branch: 'master' },
        staticPreview: this.render({ status: 'success' }),
      },
    ]
  }

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  async handle({ user, repo, branch }) {
    const data = await this.fetch({ user, repo, branch })
    if (!data.hasOwnProperty('build')) {
      // this project exists but no builds have been run on it yet
      return this.constructor.render({ status: 'no builds found' })
    }
    return this.constructor.render({ status: data.build.status })
  }
}
