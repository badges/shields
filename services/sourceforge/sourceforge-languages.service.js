import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  categories: Joi.object({
    language: Joi.array().required(),
  }).required(),
})

export default class SourceforgeLanguages extends BaseJsonService {
  static category = 'analysis'

  static route = {
    base: 'sourceforge/languages',
    pattern: ':project',
  }

  static examples = [
    {
      title: 'SourceForge languages',
      namedParams: {
        project: 'mingw',
      },
      staticPreview: this.render(6),
    },
  ]

  static defaultBadgeData = { label: 'languages' }

  static render(languages) {
    return {
      message: languages,
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
    return this.constructor.render(body.categories.language.length)
  }
}
