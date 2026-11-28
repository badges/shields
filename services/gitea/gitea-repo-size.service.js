import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { nonNegativeInteger, optionalUrl } from '../validators.js'
import { renderSizeBadge } from '../size.js'
import GiteaBase from './gitea-base.js'
import { description, httpErrorsFor } from './gitea-helper.js'

const queryParamSchema = Joi.object({
  gitea_url: optionalUrl,
}).required()

const schema = Joi.object({
  size: nonNegativeInteger,
}).required()

export default class GiteaRepoSize extends GiteaBase {
  static category = 'size'
  static route = {
    base: 'gitea/repo-size',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/gitea/repo-size/{user}/{repo}': {
      get: {
        summary: 'Gitea Repository Size',
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

  static defaultBadgeData = { label: 'repo size' }

  async fetch({ user, repo, baseUrl }) {
    // https://gitea.com/api/swagger#/repository/repoGet
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v1/repos/${user}/${repo}`,
      httpErrors: httpErrorsFor(),
    })
  }

  async handle({ user, repo }, { gitea_url: baseUrl = 'https://gitea.com' }) {
    const { size } = await this.fetch({ user, repo, baseUrl })
    return renderSizeBadge(size, 'iec', 'repo size')
  }
}
