import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  categories: Joi.object({
    translation: Joi.array().required(),
  }).required(),
})

export default class Sourceforge extends BaseJsonService {
  static category = 'activity'

  static route = {
    base: 'sourceforge/translations',
    pattern: ':project',
  }

  static examples = [
    {
      title: 'SourceForge Translations',
      namedParams: {
        project: 'guitarix',
      },
      staticPreview: this.render({
        translationCount: 4,
      }),
    },
  ]

  static defaultBadgeData = { label: 'translations' }

  static render({ translationCount }) {
    return {
      message: translationCount,
      color: 'blue',
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
      translationCount: body.categories.translation.length,
    })
  }
}
