import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'

const projectsCountRegex = /^\s[0-9]*(\.[0-9]k)?\sprojects$/
const schema = Joi.object({
  value: Joi.string().regex(projectsCountRegex).required(),
}).required()

export default class Sourcegraph extends BaseJsonService {
  static category = 'other'

  static route = {
    base: 'sourcegraph/rrc',
    pattern: ':repo(.*?)',
  }

  static openApi = {
    '/sourcegraph/rrc/{repo}': {
      get: {
        summary: 'Sourcegraph for Repo Reference Count',
        parameters: pathParams({
          name: 'repo',
          example: 'github.com/gorilla/mux',
        }),
      },
    },
  }

  static defaultBadgeData = { color: 'brightgreen', label: 'used by' }

  static render({ projectsCount }) {
    return {
      message: projectsCount,
    }
  }

  async handle({ repo }) {
    const url = `https://sourcegraph.com/.api/repos/${repo}/-/shield`
    const json = await this._requestJson({
      url,
      schema,
    })
    return this.constructor.render({ projectsCount: json.value.trim() })
  }
}
