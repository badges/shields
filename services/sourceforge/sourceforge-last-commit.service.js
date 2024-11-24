import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'
import { renderDateBadge } from '../date.js'

const schema = Joi.object({
  commits: Joi.array()
    .items(
      Joi.object({
        committed_date: Joi.string().required(),
      }).required(),
    )
    .required(),
}).required()

export default class SourceforgeLastCommit extends BaseJsonService {
  static category = 'activity'

  static route = {
    base: 'sourceforge/last-commit',
    pattern: ':project',
  }

  static openApi = {
    '/sourceforge/last-commit/{project}': {
      get: {
        summary: 'SourceForge Last Commit',
        parameters: pathParams({
          name: 'project',
          example: 'guitarix',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'last commit' }

  async fetch({ project }) {
    return this._requestJson({
      url: `https://sourceforge.net/rest/p/${project}/git/commits`,
      schema,
      httpErrors: {
        404: 'project not found',
      },
    })
  }

  async handle({ project }) {
    const body = await this.fetch({ project })
    return renderDateBadge(body.commits[0].committed_date)
  }
}
