import Joi from 'joi'
import { pathParams } from '../index.js'
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

  static openApi = {
    '/sourceforge/contributors/{project}': {
      get: {
        summary: 'SourceForge Contributors',
        parameters: pathParams({
          name: 'project',
          example: 'guitarix',
        }),
      },
    },
  }

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
