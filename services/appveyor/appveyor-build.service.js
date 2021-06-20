import { renderBuildStatusBadge } from '../build-status.js'
import AppVeyorBase from './appveyor-base.js'

export default class AppVeyorBuild extends AppVeyorBase {
  static route = this.buildRoute('appveyor/build')

  static examples = [
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

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  async handle({ user, repo, branch }) {
    const data = await this.fetch({ user, repo, branch })
    if (!('build' in data)) {
      // this project exists but no builds have been run on it yet
      return this.constructor.render({ status: 'no builds found' })
    }
    return this.constructor.render({ status: data.build.status })
  }
}
