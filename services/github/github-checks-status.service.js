import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, errorMessagesFor } from './github-helpers.js'

const schema = Joi.object({
  state: isBuildStatus,
}).required()

export default class GithubChecksStatus extends GithubAuthV3Service {
  static category = 'build'
  static route = {
    base: 'github/checks-status',
    pattern: ':user/:repo/:ref',
  }

  static examples = [
    {
      title: 'GitHub branch checks state',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        ref: 'master',
      },
      staticPreview: renderBuildStatusBadge({
        status: 'success',
      }),
      keywords: ['status'],
      documentation,
    },
    {
      title: 'GitHub commit checks state',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        ref: '91b108d4b7359b2f8794a4614c11cb1157dc9fff',
      },
      staticPreview: renderBuildStatusBadge({
        status: 'success',
      }),
      keywords: ['status'],
      documentation,
    },
    {
      title: 'GitHub tag checks state',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        ref: '3.3.0',
      },
      staticPreview: renderBuildStatusBadge({
        status: 'success',
      }),
      keywords: ['status'],
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'checks' }

  async handle({ user, repo, ref }) {
    const { state } = await this._requestJson({
      url: `/repos/${user}/${repo}/commits/${ref}/status`,
      errorMessages: errorMessagesFor('ref or repo not found'),
      schema,
    })

    return renderBuildStatusBadge({ status: state })
  }
}
