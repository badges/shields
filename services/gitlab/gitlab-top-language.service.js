import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { pathParam, queryParam } from '../index.js'
import GitLabBase from './gitlab-base.js'
import { description, httpErrorsFor } from './gitlab-helper.js'

const schema = Joi.object()
  .pattern(Joi.string(), Joi.number().min(0).max(100).precision(2))
  .required()

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
}).required()

export default class GitlabTopLanguage extends GitLabBase {
  static category = 'analysis'

  static route = {
    base: 'gitlab/languages',
    pattern: ':project+',
    queryParamSchema,
  }

  static openApi = {
    '/gitlab/languages/{project}': {
      get: {
        summary: 'GitLab Top Language',
        description,
        parameters: [
          pathParam({
            name: 'project',
            example: 'gitlab-org/gitlab',
          }),
          queryParam({
            name: 'gitlab_url',
            example: 'https://gitlab.com',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'language' }

  static render({ languageData }) {
    if (Object.keys(languageData).length > 0) {
      const topLanguage = Object.keys(languageData).reduce((a, b) =>
        languageData[a] > languageData[b] ? a : b,
      )
      return {
        label: topLanguage.toLowerCase(),
        message: `${languageData[topLanguage].toFixed(1)}%`,
        color: 'blue',
      }
    } else {
      return {
        label: 'no languages found',
        message: 'NA',
        color: 'blue',
      }
    }
  }

  async fetch({ project, baseUrl }) {
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v4/projects/${encodeURIComponent(project)}/languages`,
      httpErrors: httpErrorsFor('project not found'),
    })
  }

  async handle({ project }, { gitlab_url: baseUrl = 'https://gitlab.com' }) {
    const languageData = await this.fetch({
      project,
      baseUrl,
    })

    return this.constructor.render({ languageData })
  }
}
