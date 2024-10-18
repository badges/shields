import Joi from 'joi'
import { pathParam } from '../index.js'
import { renderSizeBadge, unitsQueryParam, unitsOpenApiParam } from '../size.js'
import { BaseGithubLanguage } from './github-languages-base.js'
import { documentation } from './github-helpers.js'

const defaultUnits = 'IEC'

const queryParamSchema = Joi.object({
  units: unitsQueryParam.default(defaultUnits),
}).required()

export default class GithubCodeSize extends BaseGithubLanguage {
  static category = 'size'
  static route = {
    base: 'github/languages/code-size',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/github/languages/code-size/{user}/{repo}': {
      get: {
        summary: 'GitHub code size in bytes',
        description: documentation,
        parameters: [
          pathParam({
            name: 'user',
            example: 'badges',
          }),
          pathParam({
            name: 'repo',
            example: 'shields',
          }),
          unitsOpenApiParam(defaultUnits),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'code size' }

  async handle({ user, repo }, { units }) {
    const data = await this.fetch({ user, repo })
    return renderSizeBadge(this.getTotalSize(data), units, 'code size')
  }
}
