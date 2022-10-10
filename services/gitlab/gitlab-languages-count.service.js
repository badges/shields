import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { metric } from '../text-formatters.js'
import { documentation, errorMessagesFor } from './gitlab-helper.js'
import GitLabBase from './gitlab-base.js'

/*
We're expecting a response like { "Ruby": 67.13, "JavaScript": 19.66 }
The keys could be anything and {} is a valid response (e.g: for an empty project)
*/
const schema = Joi.object().pattern(/./, Joi.number().min(0).max(100))

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
}).required()

export default class GitlabLanguageCount extends GitLabBase {
  static category = 'analysis'

  static route = {
    base: 'gitlab/languages/count',
    pattern: ':project+',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitLab language count',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: { gitlab_url: 'https://gitlab.com' },
      staticPreview: {
        label: 'languages',
        message: '5',
      },
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'languages' }

  static render({ languagesCount }) {
    return {
      message: metric(languagesCount),
      color: 'blue',
    }
  }

  async fetch({ project, baseUrl }) {
    // https://docs.gitlab.com/ee/api/projects.html#languages
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v4/projects/${encodeURIComponent(
        project
      )}/languages`,
      errorMessages: errorMessagesFor('project not found'),
    })
  }

  async handle({ project }, { gitlab_url: baseUrl = 'https://gitlab.com' }) {
    const data = await this.fetch({
      project,
      baseUrl,
    })
    return this.constructor.render({ languagesCount: Object.keys(data).length })
  }
}
