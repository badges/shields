import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const statusSchema = Joi.object({
  status: Joi.string().required(),
}).required()

export default class RequiresIo extends BaseJsonService {
  static category = 'dependencies'

  static route = {
    base: 'requires',
    pattern: ':service/:user/:repo/:branch*',
  }

  static examples = [
    {
      title: 'Requires.io',
      pattern: ':service/:user/:repo',
      namedParams: { service: 'github', user: 'celery', repo: 'celery' },
      staticPreview: this.render({ status: 'up-to-date' }),
    },
    {
      title: 'Requires.io (branch)',
      pattern: ':service/:user/:repo/:branch',
      namedParams: {
        service: 'github',
        user: 'celery',
        repo: 'celery',
        branch: 'master',
      },
      staticPreview: this.render({ status: 'up-to-date' }),
    },
  ]

  static defaultBadgeData = { label: 'requirements' }

  static render({ status }) {
    let message = status
    let color = 'lightgrey'
    if (status === 'up-to-date') {
      message = 'up to date'
      color = 'brightgreen'
    } else if (status === 'outdated') {
      color = 'yellow'
    } else if (status === 'insecure') {
      color = 'red'
    }
    return { message, color }
  }

  async fetch({ service, user, repo, branch }) {
    const url = `https://requires.io/api/v1/status/${service}/${user}/${repo}`
    return this._requestJson({
      url,
      schema: statusSchema,
      options: { qs: { branch } },
    })
  }

  async handle({ service, user, repo, branch }) {
    const { status } = await this.fetch({ service, user, repo, branch })
    return this.constructor.render({ status })
  }
}
