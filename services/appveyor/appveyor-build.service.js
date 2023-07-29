import { renderBuildStatusBadge } from '../build-status.js'
import { pathParams } from '../index.js'
import AppVeyorBase from './appveyor-base.js'

export default class AppVeyorBuild extends AppVeyorBase {
  static route = this.buildRoute('appveyor/build')

  static openApi = {
    '/appveyor/build/{user}/{repo}': {
      get: {
        summary: 'AppVeyor Build',
        parameters: pathParams(
          { name: 'user', example: 'gruntjs' },
          { name: 'repo', example: 'grunt' },
        ),
      },
    },
    '/appveyor/build/{user}/{repo}/{branch}': {
      get: {
        summary: 'AppVeyor Build (with branch)',
        parameters: pathParams(
          { name: 'user', example: 'gruntjs' },
          { name: 'repo', example: 'grunt' },
          { name: 'branch', example: 'master' },
        ),
      },
    },
  }

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
