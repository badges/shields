import Joi from 'joi'
import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import BaseSourceForgeService from './sourceforge-base.js'

const schema = Joi.object({
  categories: Joi.object({
    language: Joi.array().required(),
  }).required(),
}).required()

export default class SourceforgeLanguages extends BaseSourceForgeService {
  static category = 'analysis'

  static route = {
    base: 'sourceforge/languages',
    pattern: ':project',
  }

  static openApi = {
    '/sourceforge/languages/{project}': {
      get: {
        summary: 'SourceForge Languages',
        parameters: pathParams({
          name: 'project',
          example: 'mingw',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'languages' }

  static render(languages) {
    return {
      message: metric(languages),
      color: 'blue',
    }
  }

  async handle({ project }) {
    const body = await this.fetch({ project, schema })
    return this.constructor.render(body.categories.language.length)
  }
}
