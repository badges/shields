import Joi from 'joi'
import { renderContributorBadge } from '../contributor-count.js'
import BaseSourceForgeService from './sourceforge-base.js'

const schema = Joi.object({
  developers: Joi.array().required(),
}).required()

export default class SourceforgeContributors extends BaseSourceForgeService {
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

  async handle({ project }) {
    const body = await this.fetch({ project, schema })
    return this.constructor.render({
      contributorCount: body.developers.length,
    })
  }
}
