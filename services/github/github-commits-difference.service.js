import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const schema = Joi.object({ total_commits: nonNegativeInteger }).required()

const queryParamSchema = Joi.object({
  base: Joi.string().required(),
  head: Joi.string().required(),
}).required()

export default class GithubCommitsDifference extends GithubAuthV3Service {
  static category = 'activity'
  static route = {
    base: 'github/commits-difference',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/github/commits-difference/{user}/{repo}': {
      get: {
        summary: 'GitHub commits difference between two branches/tags/commits',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'microsoft' }),
          pathParam({ name: 'repo', example: 'vscode' }),
          queryParam({ name: 'base', example: '1.60.0', required: true }),
          queryParam({ name: 'head', example: '82f2db7', required: true }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'commits difference' }

  static render({ commitCount }) {
    return {
      message: metric(commitCount),
      color: 'blue',
    }
  }

  async handle({ user, repo }, { base, head }) {
    const notFoundMessage = 'could not establish commit difference between refs'
    const { total_commits: commitCount } = await this._requestJson({
      schema,
      url: `/repos/${user}/${repo}/compare/${base}...${head}`,
      httpErrors: httpErrorsFor(notFoundMessage),
    })

    return this.constructor.render({ commitCount })
  }
}
