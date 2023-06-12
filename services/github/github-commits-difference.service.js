import Joi from 'joi'
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

  static examples = [
    {
      title: 'GitHub commits difference between two branches/tags/commits',
      namedParams: {
        user: 'microsoft',
        repo: 'vscode',
      },
      queryParams: {
        base: '1.60.0',
        head: '82f2db7',
      },
      staticPreview: this.render({
        commitCount: 9227,
      }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'commits difference', namedLogo: 'github' }

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
