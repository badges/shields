import Joi from 'joi'
import { formatDate } from '../text-formatters.js'
import { age as ageColor } from '../color-formatters.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, errorMessagesFor } from './github-helpers.js'

const schema = Joi.object({
  updated_at: Joi.string().required(),
}).required()

export default class GithubGistLastCommit extends GithubAuthV3Service {
  static category = 'activity'
  static route = { base: 'github-gist/last-commit', pattern: ':gistId' }
  static examples = [
    {
      title: 'GitHub Gist last commit',
      namedParams: {
        gistId: '8710649',
      },
      staticPreview: this.render({ commitDate: '2022-07-29T20:01:41Z' }),
      keywords: ['latest'],
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'last commit' }

  static render({ commitDate }) {
    return {
      message: formatDate(commitDate),
      color: ageColor(Date.parse(commitDate)),
    }
  }

  async fetch({ gistId }) {
    return this._requestJson({
      url: `/gists/${gistId}`,
      schema,
      errorMessages: errorMessagesFor('gist not found'),
    })
  }

  async handle({ gistId }) {
    const { updated_at: commitDate } = await this.fetch({ gistId })
    return this.constructor.render({ commitDate })
  }
}
