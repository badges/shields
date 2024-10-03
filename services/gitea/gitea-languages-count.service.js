import Joi from 'joi'
import { nonNegativeInteger, optionalUrl } from '../validators.js'
import { metric } from '../text-formatters.js'
import { pathParam, queryParam } from '../index.js'
import { description, httpErrorsFor } from './gitea-helper.js'
import GiteaBase from './gitea-base.js'

/*
We're expecting a response like { "Python": 39624, "Shell": 104 }
The keys could be anything and {} is a valid response (e.g: for an empty repo)
*/
const schema = Joi.object().pattern(/./, nonNegativeInteger)

const queryParamSchema = Joi.object({
  gitea_url: optionalUrl,
}).required()

export default class GiteaLanguageCount extends GiteaBase {
  static category = 'analysis'

  static route = {
    base: 'gitea/languages/count',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/gitea/languages/count/{user}/{repo}': {
      get: {
        summary: 'Gitea language count',
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

  static defaultBadgeData = { label: 'languages' }

  static render({ languagesCount }) {
    return {
      message: metric(languagesCount),
      color: 'blue',
    }
  }

  async fetch({ user, repo, baseUrl }) {
    // https://gitea.com/api/swagger#/repository/repoGetLanguages
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v1/repos/${user}/${repo}/languages`,
      httpErrors: httpErrorsFor(),
    })
  }

  async handle({ user, repo }, { gitea_url: baseUrl = 'https://gitea.com' }) {
    const data = await this.fetch({
      user,
      repo,
      baseUrl,
    })
    return this.constructor.render({ languagesCount: Object.keys(data).length })
  }
}
