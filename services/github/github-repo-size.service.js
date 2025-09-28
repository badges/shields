import Joi from 'joi'
import { pathParams } from '../index.js'
import { renderSizeBadge } from '../size.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const schema = Joi.object({
  size: nonNegativeInteger,
}).required()

export default class GithubRepoSize extends GithubAuthV3Service {
  static category = 'size'
  static route = { base: 'github/repo-size', pattern: ':user/:repo' }
  static openApi = {
    '/github/repo-size/{user}/{repo}': {
      get: {
        summary: 'GitHub repo size',
        description: documentation,
        parameters: pathParams(
          {
            name: 'user',
            example: 'atom',
          },
          {
            name: 'repo',
            example: 'atom',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'repo size' }

  async fetch({ user, repo }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}`,
      schema,
      httpErrors: httpErrorsFor(),
    })
  }

  async handle({ user, repo }) {
    const { size } = await this.fetch({ user, repo })
    // note the GH API returns size in KiB
    // so we multiply by 1024 to get a size in bytes and then format that in IEC bytes
    return renderSizeBadge(size * 1024, 'iec', 'repo size')
  }
}
