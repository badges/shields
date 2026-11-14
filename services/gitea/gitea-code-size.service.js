import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { nonNegativeInteger, optionalUrl } from '../validators.js'
import { renderSizeBadge } from '../size.js'
import GiteaBase from './gitea-base.js'
import { description, httpErrorsFor } from './gitea-helper.js'

const queryParamSchema = Joi.object({
  gitea_url: optionalUrl,
}).required()

const schema = Joi.object()
  .pattern(Joi.string().required(), nonNegativeInteger)
  .required()

export default class GiteaCodeSize extends GiteaBase {
  static category = 'size'
  static route = {
    base: 'gitea/code-size',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/gitea/code-size/{user}/{repo}': {
      get: {
        summary: 'Gitea Code Size',
        description,
        parameters: [
          pathParam({
            name: 'user',
            example: 'gitea',
          }),
          pathParam({
            name: 'repo',
            example: 'tea',
          }),
          queryParam({
            name: 'gitea_url',
            example: 'https://gitea.com',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'code size' }

  async fetch({ user, repo, baseUrl }) {
    // https://gitea.com/api/swagger#/repository/repoGetLanguages
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v1/repos/${user}/${repo}/languages`,
      httpErrors: httpErrorsFor(),
    })
  }

  async handle({ user, repo }, { gitea_url: baseUrl = 'https://gitea.com' }) {
    const languageData = await this.fetch({ user, repo, baseUrl })
    const size = Object.values(languageData).reduce((a, b) => a + b, 0)
    return renderSizeBadge(size, 'iec', 'code size')
  }
}
