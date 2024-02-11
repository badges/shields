import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { optionalUrl, nonNegativeInteger } from '../validators.js'
import { metric } from '../text-formatters.js'
import GiteaBase from './gitea-base.js'
import { description, httpErrorsFor } from './gitea-helper.js'

const schema = Joi.object({
  forks_count: nonNegativeInteger,
}).required()

const queryParamSchema = Joi.object({
  gitea_url: optionalUrl,
}).required()

export default class GiteaForks extends GiteaBase {
  static category = 'social'

  static route = {
    base: 'gitea/forks',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/gitea/forks/{user}/{repo}': {
      get: {
        summary: 'Gitea Forks',
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

  static defaultBadgeData = { label: 'forks', namedLogo: 'gitea' }

  static render({ baseUrl, user, repo, forkCount }) {
    return {
      message: metric(forkCount),
      style: 'social',
      color: 'blue',
      link: [`${baseUrl}/${user}/${repo}`, `${baseUrl}/${user}/${repo}/forks`],
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
    const { forks_count: forkCount } = await this.fetch({
      user,
      repo,
      baseUrl,
    })
    return this.constructor.render({ baseUrl, user, repo, forkCount })
  }
}
