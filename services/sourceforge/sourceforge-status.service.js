import Joi from 'joi'
import BaseSourceForgeService from './sourceforge-base.js'

const schema = Joi.object({
  status: Joi.string().required(),
}).required()

export default class SourceforgeStatus extends BaseSourceForgeService {
  static category = 'monitoring'

  static route = {
    base: 'sourceforge/status',
    pattern: ':project',
  }

  static examples = [
    {
      title: 'SourceForge Status',
      namedParams: {
        project: 'mingw',
      },
      staticPreview: this.render('active'),
    },
  ]

  static defaultBadgeData = { label: 'status' }

  static render(status) {
    return {
      message: status,
      color: status === 'active' ? 'green' : 'red',
    }
  }

  async handle({ project }) {
    const body = await this.fetch({ project, schema })
    return this.constructor.render(body.status)
  }
}
