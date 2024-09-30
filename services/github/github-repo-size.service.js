import Joi from 'joi'
import { pathParam } from '../index.js'
import { renderSizeBadge, unitsQueryParam, unitsOpenApiParam } from '../size.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const defaultUnits = 'IEC'

const schema = Joi.object({
  size: nonNegativeInteger,
}).required()

const queryParamSchema = Joi.object({
  units: unitsQueryParam.default(defaultUnits),
}).required()

export default class GithubRepoSize extends GithubAuthV3Service {
  static category = 'size'

  static route = {
    base: 'github/repo-size',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/github/repo-size/{user}/{repo}': {
      get: {
        summary: 'GitHub repo size',
        description: documentation,
        parameters: [
          pathParam({
            name: 'user',
            example: 'atom',
          }),
          pathParam({
            name: 'repo',
            example: 'atom',
          }),
          unitsOpenApiParam(defaultUnits),
        ],
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

  async handle({ user, repo }, { units }) {
    const { size } = await this.fetch({ user, repo })
    // note the GH API returns size in KiB
    // so we multiply by 1024 to get a size in bytes and then format that in IEC bytes
    return renderSizeBadge(size * 1024, units, 'repo size')
  }
}
