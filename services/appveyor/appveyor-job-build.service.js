import { renderBuildStatusBadge } from '../build-status.js'
import { NotFound, pathParams } from '../index.js'
import AppVeyorBase from './appveyor-base.js'

export default class AppVeyorJobBuild extends AppVeyorBase {
  static route = {
    base: 'appveyor/job/build',
    pattern: ':user/:repo/:job/:branch*',
  }

  static openApi = {
    '/appveyor/job/build/{user}/{repo}/{job}': {
      get: {
        summary: 'AppVeyor Job',
        parameters: pathParams(
          { name: 'user', example: 'wpmgprostotema' },
          { name: 'repo', example: 'voicetranscoder' },
          { name: 'job', example: 'Linux' },
        ),
      },
    },
    '/appveyor/job/build/{user}/{repo}/{job}/{branch}': {
      get: {
        summary: 'AppVeyor Job (with branch)',
        parameters: pathParams(
          { name: 'user', example: 'wpmgprostotema' },
          { name: 'repo', example: 'voicetranscoder' },
          { name: 'job', example: 'Windows' },
          { name: 'branch', example: 'master' },
        ),
      },
    },
  }

  transform({ data, jobName }) {
    if (!('build' in data)) {
      // this project exists but no builds have been run on it yet
      return { status: 'no builds found' }
    }

    const {
      build: { jobs },
    } = data
    if (!jobs) {
      throw new NotFound({ prettyMessage: 'no jobs found' })
    }

    const job = jobs.find(j => j.name === jobName)

    if (!job) {
      throw new NotFound({ prettyMessage: 'job not found' })
    }

    return { status: job.status }
  }

  async handle({ user, repo, job, branch }) {
    const data = await this.fetch({ user, repo, branch })
    const { status } = this.transform({ data, jobName: job })
    return renderBuildStatusBadge({ status })
  }
}
