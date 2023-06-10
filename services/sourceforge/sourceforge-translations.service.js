import Joi from 'joi'
import { metric } from '../text-formatters.js'
import BaseSourceForgeService from './sourceforge-base.js'

const schema = Joi.object({
  categories: Joi.object({
    translation: Joi.array().required(),
  }).required(),
}).required()

export default class SourceforgeTranslations extends BaseSourceForgeService {
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
      message: metric(translationCount),
      color: 'blue',
    }
  }

  async handle({ project }) {
    const body = await this.fetch({ project, schema })
    return this.constructor.render({
      translationCount: body.categories.translation.length,
    })
  }
}
