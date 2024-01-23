import Joi from 'joi'
import { pathParams } from '../index.js'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const schema = Joi.object({
  state: isBuildStatus,
}).required()

export default class GithubChecksStatus extends GithubAuthV3Service {
  static category = 'build'
  static route = {
    base: 'github/checks-status',
    pattern: ':user/:repo/:ref',
  }

  static openApi = {
    '/github/checks-status/{user}/{repo}/{ref}': {
      get: {
        summary: 'GitHub tag checks state',
        description: documentation,
        parameters: pathParams(
          {
            name: 'user',
            example: 'badges',
          },
          {
            name: 'repo',
            example: 'shields',
          },
          {
            name: 'ref',
            example: '3.3.0',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'checks' }

  async handle({ user, repo, ref }) {
    const { state } = await this._requestJson({
      url: `/repos/${user}/${repo}/commits/${ref}/status`,
      httpErrors: httpErrorsFor('ref or repo not found'),
      schema,
    })

    return renderBuildStatusBadge({ status: state })
  }
}
