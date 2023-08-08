import { coveragePercentage as coveragePercentageColor } from '../color-formatters.js'
import { NotFound } from '../index.js'
import { BasePuppetForgeModulesValidationsService } from './puppetforge-base.js'

export default class PuppetforgeModuleFeedback extends BasePuppetForgeModulesValidationsService {
  static category = 'rating'

  static route = {
    base: 'puppetforge/f',
    pattern: ':user/:moduleName',
  }

  static examples = [
    {
      title: 'Puppet Forge feedback score',
      namedParams: {
        user: 'camptocamp',
        moduleName: 'openssl',
      },
      staticPreview: this.render({ score: 61 }),
    },
  ]

  static defaultBadgeData = { label: 'score' }

  static render({ score }) {
    return {
      message: `${score}%`,
      color: coveragePercentageColor(score),
    }
  }

  async handle({ user, moduleName }) {
    const data = await this.fetch({ user, moduleName })
    if (data.at(-1) == null || data.at(-1).score == null) {
      throw new NotFound({ prettyMessage: 'unknown' })
    }
    return this.constructor.render({ score: data.at(-1).score })
  }
}
