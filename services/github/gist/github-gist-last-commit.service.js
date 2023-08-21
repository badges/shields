import Joi from 'joi'
import { pathParams } from '../../index.js'
import { formatDate } from '../../text-formatters.js'
import { age as ageColor } from '../../color-formatters.js'
import { GithubAuthV3Service } from '../github-auth-service.js'
import { documentation, httpErrorsFor } from '../github-helpers.js'

const schema = Joi.object({
  updated_at: Joi.string().required(),
}).required()

export default class GistLastCommit extends GithubAuthV3Service {
  static category = 'activity'
  static route = { base: 'github/gist/last-commit', pattern: ':gistId' }
  static openApi = {
    '/github/gist/last-commit/{gistId}': {
      get: {
        summary: 'GitHub Gist last commit',
        description: documentation,
        parameters: pathParams({
          name: 'gistId',
          example: '8710649',
        }),
      },
    },
  }

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
      httpErrors: httpErrorsFor('gist not found'),
    })
  }

  async handle({ gistId }) {
    const { updated_at: commitDate } = await this.fetch({ gistId })
    return this.constructor.render({ commitDate })
  }
}
