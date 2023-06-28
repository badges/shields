import Joi from 'joi'
import BaseSourceForgeService from './sourceforge-base.js'

const schema = Joi.object({
  categories: Joi.object({
    language: Joi.array().required(),
  }).required(),
}).required()

export default class SourceforgeLanguage extends BaseSourceForgeService {
  static category = 'analysis'

  static route = {
    base: 'sourceforge/language',
    pattern: ':index/:project',
  }

  static examples = [
    {
      title: 'SourceForge language',
      namedParams: {
        project: 'mingw',
        index: '0',
      },
      staticPreview: this.render('Fortran'),
    },
  ]

  static defaultBadgeData = { label: 'language' }

  static render(language) {
    return {
      message: language,
      color: 'blue',
    }
  }

  async handle({ project, index }) {
    const body = await this.fetch({ project, schema })
    return this.constructor.render(
      body.categories.language[parseInt(index)]?.fullname ||
        body.categories.language[0]?.fullname
    )
  }
}
