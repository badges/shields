import { coveragePercentage as coveragePercentageColor } from '../color-formatters.js'
import { pathParams } from '../index.js'
import { BasePuppetForgeModulesValidationService } from './puppetforge-base.js'

export default class PuppetforgeModuleQualityScoreService extends BasePuppetForgeModulesValidationService {
  static category = 'rating'

  static route = {
    base: 'puppetforge/qualityscore',
    pattern: ':user/:moduleName',
  }

  static openApi = {
    '/puppetforge/qualityscore/{user}/{moduleName}': {
      get: {
        summary: 'Puppet Forge quality score',
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

  static defaultBadgeData = { label: 'quality score' }

  static render({ score }) {
    return {
      message: `${score}%`,
      color: coveragePercentageColor(score),
    }
  }

  async handle({ user, moduleName }) {
    const data = await this.fetch({ user, moduleName })
    const qualityScore = data.find(el => el.name === 'total').score
    return this.constructor.render({ score: qualityScore })
  }
}
