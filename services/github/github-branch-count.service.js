import gql from 'graphql-tag'
import Joi from 'joi'
import { pathParam } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import { transformErrors, documentation } from './github-helpers.js'

const schema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      refs: Joi.object({
        totalCount: nonNegativeInteger,
      }).required(),
    }).required(),
  }).required(),
}).required()

export default class GithubBranchCount extends GithubAuthV4Service {
  static category = 'analysis'

  static route = {
    base: 'github/branches',
    pattern: ':user/:repo',
  }

  static openApi = {
    '/github/branches/{user}/{repo}': {
      get: {
        summary: 'GitHub branch count',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'shields' }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'branches', color: 'blue' }

  static render({ count }) {
    return {
      label: 'branches',
      message: metric(count),
      color: 'blue',
    }
  }

  async fetch({ user, repo }) {
    return this._requestGraphql({
      query: gql`
        query ($user: String!, $repo: String!) {
          repository(owner: $user, name: $repo) {
            refs(refPrefix: "refs/heads/", first: 1) {
              totalCount
            }
          }
        }
      `,
      variables: { user, repo },
      schema,
      transformErrors,
    })
  }

  async handle({ user, repo }) {
    const json = await this.fetch({ user, repo })
    const count = json.data.repository.refs.totalCount
    return this.constructor.render({ count })
  }
}
