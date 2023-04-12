import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { renderContributorBadge } from '../contributor-count.js'

const schema = Joi.object({
  developers: Joi.array().required(),
}).required()

export default class Sourceforge extends BaseJsonService {
  static category = 'activity'

  static route = {
    base: 'sourceforge/contributors',
    pattern: ':project',
  }

  static examples = [
    {
      title: 'SourceForge contributors',
      namedParams: {
        project: 'guitarix',
      },
      staticPreview: this.render({
        contributorCount: 9,
      }),
    },
  ]

  static defaultBadgeData = { label: 'contributors' }

  static render({ contributorCount }) {
    return renderContributorBadge({
      contributorCount,
    })
  }

  async fetch({ project }) {
    return this._requestJson({
      url: `https://sourceforge.net/rest/p/${project}/`,
      schema,
      errorMessages: {
        404: 'project not found',
      },
    })
  }

  async handle({ project }) {
    const body = await this.fetch({ project })
    return this.constructor.render({
      contributorCount: body.developers.length,
    })
  }
}
