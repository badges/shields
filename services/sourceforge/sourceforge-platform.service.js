import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  categories: Joi.object({
    os: Joi.array()
      .items({
        fullname: Joi.string().required(),
      })
      .required(),
  }).required(),
})

export default class SourceforgePlatform extends BaseJsonService {
  static category = 'platform-support'

  static route = {
    base: 'sourceforge/platform',
    pattern: ':project',
  }

  static examples = [
    {
      title: 'SourceForge Platform',
      namedParams: {
        project: 'guitarix',
      },
      staticPreview: this.render({
        platforms: ['linux', 'bsd'],
      }),
    },
  ]

  static defaultBadgeData = { label: 'platform' }

  static render({ platforms }) {
    return {
      message: platforms.join(' | '),
    }
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
      platforms: body.categories.os.map(obj => obj.fullname),
    })
  }
}
