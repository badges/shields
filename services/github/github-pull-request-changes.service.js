import Joi from 'joi'
import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const schema = Joi.object({
  additions: nonNegativeInteger,
  deletions: nonNegativeInteger,
}).required()

export default class GithubPullRequestChanges extends GithubAuthV3Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github/pulls',
    pattern: ':variant(additions|deletions)/:user/:repo/:number(\\d+)',
  }

  static openApi = {
    '/github/pulls/{variant}/{user}/{repo}/{number}': {
      get: {
        summary: 'GitHub pull request additions/deletions',
        description: documentation,
        parameters: pathParams(
          {
            name: 'variant',
            example: 'additions',
            schema: { type: 'string', enum: this.getEnum('variant') },
          },
          { name: 'user', example: 'badges' },
          { name: 'repo', example: 'shields' },
          { name: 'number', example: '12083' },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'changes' }

  static render({ variant, count }) {
    if (variant === 'additions') {
      return {
        label: 'additions',
        message: `+${metric(count)}`,
        color: 'green',
      }
    }
    return { label: 'deletions', message: `-${metric(count)}`, color: 'red' }
  }

  async handle({ variant, user, repo, number }) {
    // https://docs.github.com/en/rest/pulls/pulls#get-a-pull-request
    const json = await this._requestJson({
      schema,
      url: `/repos/${user}/${repo}/pulls/${number}`,
      httpErrors: httpErrorsFor('pull request or repo not found'),
    })
    return this.constructor.render({ variant, count: json[variant] })
  }
}
