import Joi from 'joi'
import BaseSourceForgeService from './sourceforge-base.js'

const schema = Joi.object({
  categories: Joi.object({
    os: Joi.array()
      .items({
        fullname: Joi.string().required(),
      })
      .required(),
  }).required(),
}).required()

export default class SourceforgePlatform extends BaseSourceForgeService {
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

  async handle({ project }) {
    const body = await this.fetch({ project, schema })
    return this.constructor.render({
      platforms: body.categories.os.map(obj => obj.fullname),
    })
  }
}
