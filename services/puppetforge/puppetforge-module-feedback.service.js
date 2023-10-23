import { coveragePercentage as coveragePercentageColor } from '../color-formatters.js'
import { NotFound, pathParams } from '../index.js'
import { BasePuppetForgeModulesService } from './puppetforge-base.js'

export default class PuppetforgeModuleFeedback extends BasePuppetForgeModulesService {
  static category = 'rating'

  static route = {
    base: 'puppetforge/f',
    pattern: ':user/:moduleName',
  }

  static openApi = {
    '/puppetforge/f/{user}/{moduleName}': {
      get: {
        summary: 'Puppet Forge feedback score',
        parameters: pathParams(
          {
            name: 'user',
            example: 'camptocamp',
          },
          {
            name: 'moduleName',
            example: 'openssl',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'score' }

  static render({ score }) {
    return {
      message: `${score}%`,
      color: coveragePercentageColor(score),
    }
  }

  async handle({ user, moduleName }) {
    const data = await this.fetch({ user, moduleName })
    if (data.feedback_score == null) {
      throw new NotFound({ prettyMessage: 'unknown' })
    }
    return this.constructor.render({ score: data.feedback_score })
  }
}
