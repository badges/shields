import Joi from 'joi'
import { BaseJsonService } from '../index.js'
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

  static examples = [
    {
      title: 'SourceForge commit count',
      namedParams: {
        project: 'guitarix',
      },
      staticPreview: this.render({
        commitCount: 1365,
      }),
    },
  ]

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
