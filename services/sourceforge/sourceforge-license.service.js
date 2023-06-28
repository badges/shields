import Joi from 'joi'
import { renderLicenseBadge } from '../licenses.js'
import BaseSourceForgeService from './sourceforge-base.js'

const schema = Joi.object({
  categories: Joi.object({
    license: Joi.array().required(),
  }).required(),
}).required()

export default class SourceforgeLicense extends BaseSourceForgeService {
  static category = 'license'

  static route = {
    base: 'sourceforge/license',
    pattern: ':index/:project',
  }

  static examples = [
    {
      title: 'SourceForge license',
      namedParams: {
        project: 'mingw',
        index: '0',
      },
      staticPreview: this.render('BSD'),
    },
  ]

  static defaultBadgeData = { label: 'license' }

  static render(license) {
    return renderLicenseBadge({ license })
  }

  async handle({ project, index }) {
    const body = await this.fetch({ project, schema })
    return this.constructor.render(
      body.categories.license[parseInt(index)]?.fullname ||
        body.categories.license[0]?.fullname
    )
  }
}
