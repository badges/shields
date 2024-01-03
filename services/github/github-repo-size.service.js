import Joi from 'joi'
import prettyBytes from 'pretty-bytes'
import { pathParams } from '../index.js'
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

  static render({ size }) {
    return {
      // note the GH API returns size in Kb
      message: prettyBytes(size * 1024),
      color: 'blue',
    }
  }

  async fetch({ user, repo }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}`,
      schema,
      httpErrors: httpErrorsFor(),
    })
  }

  async handle({ user, repo }) {
    const { size } = await this.fetch({ user, repo })
    return this.constructor.render({ size })
  }
}
