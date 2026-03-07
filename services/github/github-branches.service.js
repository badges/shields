import gql from 'graphql-tag'
import Joi from 'joi'
import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import {
  documentation as commonDocumentation,
  transformErrors,
} from './github-helpers.js'

const description = `
The GitHub branches badge shows the total number of branches in a repository.

${commonDocumentation}
`

const schema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      refs: Joi.object({
        totalCount: nonNegativeInteger,
      }).required(),
    }).required(),
  }).required(),
}).required()

export default class GithubBranches extends GithubAuthV4Service {
  static category = 'other'

  static route = {
    base: 'github/branches',
    pattern: ':user/:repo',
  }

  static openApi = {
    '/github/branches/{user}/{repo}': {
      get: {
        summary: 'GitHub branches',
        description,
        parameters: pathParams(
          { name: 'user', example: 'badges' },
          { name: 'repo', example: 'shields' },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'branches', namedLogo: 'github' }

  static render({ branchCount }) {
    return {
      message: metric(branchCount),
      color: 'blue',
    }
  }

  async handle({ user, repo }) {
    const json = await this._requestGraphql({
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
    return this.constructor.render({
      branchCount: json.data.repository.refs.totalCount,
    })
  }
}
