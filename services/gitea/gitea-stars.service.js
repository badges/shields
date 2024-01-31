import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { optionalUrl, nonNegativeInteger } from '../validators.js'
import { metric } from '../text-formatters.js'
import GiteaBase from './gitea-base.js'
import { description, httpErrorsFor } from './gitea-helper.js'

const schema = Joi.object({
  stars_count: nonNegativeInteger,
}).required()

const queryParamSchema = Joi.object({
  gitea_url: optionalUrl,
}).required()

export default class GiteaStars extends GiteaBase {
  static category = 'social'

  static route = {
    base: 'gitea/stars',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/gitea/stars/{user}/{repo}': {
      get: {
        summary: 'Gitea Stars',
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

  static defaultBadgeData = { label: 'stars', namedLogo: 'gitea' }

  static render({ baseUrl, user, repo, starCount }) {
    return {
      message: metric(starCount),
      style: 'social',
      color: 'blue',
      link: [`${baseUrl}/${user}/${repo}`, `${baseUrl}/${user}/${repo}/stars`],
    }
  }

  async fetch({ user, repo, baseUrl }) {
    // https://gitea.com/api/swagger#/repository
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v1/repos/${user}/${repo}`,
      httpErrors: httpErrorsFor(),
    })
  }

  async handle({ user, repo }, { gitea_url: baseUrl = 'https://gitea.com' }) {
    const { stars_count: starCount } = await this.fetch({
      user,
      repo,
      baseUrl,
    })
    return this.constructor.render({ baseUrl, user, repo, starCount })
  }
}
