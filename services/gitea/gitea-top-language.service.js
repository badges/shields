import Joi from 'joi'
import { InvalidResponse, pathParam, queryParam } from '../index.js'
import { nonNegativeInteger, optionalUrl } from '../validators.js'
import GiteaBase from './gitea-base.js'
import { description, httpErrorsFor } from './gitea-helper.js'

const schema = Joi.object()
  .pattern(Joi.string().required(), nonNegativeInteger)
  .required()

// const schema = Joi.object()
//   .pattern(
//     Joi.string().required(),
//     Joi.number().min(0).max(100).precision(2).required(),
//   )
//   .required()

const queryParamSchema = Joi.object({
  gitea_url: optionalUrl,
}).required()

export default class GiteaTopLanguage extends GiteaBase {
  static category = 'analysis'

  static route = {
    base: 'gitea/languages',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/gitea/languages/{user}/{repo}': {
      get: {
        summary: 'Gitea top language',
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

  static defaultBadgeData = { label: 'language' }

  static render({ languageData }) {
    const topLanguage = Object.keys(languageData).reduce((a, b) =>
      languageData[a] > languageData[b] ? a : b,
    )
    const totalBytes = Object.values(languageData).reduce((a, b) => a + b)
    return {
      label: topLanguage.toLowerCase(),
      message: `${(languageData[topLanguage] / totalBytes).toFixed(3) * 100}%`,
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
    const languageData = await this.fetch({
      user,
      repo,
      baseUrl,
    })

    if (Object.keys(languageData).length > 0) {
      return this.constructor.render({ languageData })
    } else {
      throw new InvalidResponse({ prettyMessage: 'no languages found' })
    }
  }
}
