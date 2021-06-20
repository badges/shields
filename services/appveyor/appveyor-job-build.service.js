import { renderBuildStatusBadge } from '../build-status.js'
import { NotFound } from '../index.js'
import AppVeyorBase from './appveyor-base.js'

export default class AppVeyorJobBuild extends AppVeyorBase {
  static route = {
    base: 'appveyor/job/build',
    pattern: ':user/:repo/:job/:branch*',
  }

  static examples = [
    {
      title: 'AppVeyor Job',
      pattern: ':user/:repo/:job',
      namedParams: {
        user: 'wpmgprostotema',
        repo: 'voicetranscoder',
        job: 'Linux',
      },
      staticPreview: renderBuildStatusBadge({ status: 'success' }),
    },
    {
      title: 'AppVeyor Job branch',
      pattern: ':user/:repo/:job/:branch',
      namedParams: {
        user: 'wpmgprostotema',
        repo: 'voicetranscoder',
        job: 'Windows',
        branch: 'master',
      },
      staticPreview: renderBuildStatusBadge({ status: 'success' }),
    },
  ]

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
