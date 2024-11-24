import Joi from 'joi'
import { renderSizeBadge } from '../size.js'
import { nonNegativeInteger } from '../validators.js'
import { NotFound, pathParam, queryParam } from '../index.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const queryParamSchema = Joi.object({
  branch: Joi.string(),
}).required()

const schema = Joi.alternatives(
  Joi.object({
    size: nonNegativeInteger,
  }).required(),
  Joi.array().required(),
)

export default class GithubSize extends GithubAuthV3Service {
  static category = 'size'

  static route = {
    base: 'github/size',
    pattern: ':user/:repo/:path+',
    queryParamSchema,
  }

  static openApi = {
    '/github/size/{user}/{repo}/{path}': {
      get: {
        summary: 'GitHub file size in bytes',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'webcaetano' }),
          pathParam({ name: 'repo', example: 'craft' }),
          pathParam({ name: 'path', example: 'build/phaser-craft.min.js' }),
          queryParam({
            name: 'branch',
            example: 'master',
            description: 'Can be a branch, a tag or a commit hash.',
          }),
        ],
      },
    },
  }

  async fetch({ user, repo, path, branch }) {
    if (branch) {
      return this._requestJson({
        url: `/repos/${user}/${repo}/contents/${path}?ref=${branch}`,
        schema,
        httpErrors: httpErrorsFor('repo, branch or file not found'),
      })
    } else {
      return this._requestJson({
        url: `/repos/${user}/${repo}/contents/${path}`,
        schema,
        httpErrors: httpErrorsFor('repo or file not found'),
      })
    }
  }

  async handle({ user, repo, path }, queryParams) {
    const branch = queryParams.branch
    const body = await this.fetch({ user, repo, path, branch })
    if (Array.isArray(body)) {
      throw new NotFound({ prettyMessage: 'not a regular file' })
    }
    return renderSizeBadge(body.size, 'iec')
  }
}
