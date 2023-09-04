import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'
import { metric } from '../text-formatters.js'

const schema = Joi.object({
  commit_count: Joi.number().required(),
}).required()

export default class SourceforgeCommitCount extends BaseJsonService {
  static category = 'activity'

  static route = {
    base: 'sourceforge/commit-count',
    pattern: ':project',
  }

  static openApi = {
    '/sourceforge/commit-count/{project}': {
      get: {
        summary: 'SourceForge Commit Count',
        parameters: pathParams({
          name: 'project',
          example: 'guitarix',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'commit count' }

  static render({ commitCount }) {
    return {
      message: metric(commitCount),
      color: 'blue',
    }
  }

  async fetch({ project }) {
    return this._requestJson({
      url: `https://sourceforge.net/rest/p/${project}/git`,
      schema,
      httpErrors: {
        404: 'project not found',
      },
    })
  }

  async handle({ project }) {
    const body = await this.fetch({ project })
    return this.constructor.render({
      commitCount: body.commit_count,
    })
  }
}
