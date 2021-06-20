import { NotFound } from '../index.js'
import { BasePuppetForgeModulesService } from './puppetforge-base.js'

export default class PuppetforgeModuleEndorsement extends BasePuppetForgeModulesService {
  static category = 'rating'

  static route = {
    base: 'puppetforge/e',
    pattern: ':user/:moduleName',
  }

  static examples = [
    {
      title: 'Puppet Forge endorsement',
      namedParams: {
        user: 'camptocamp',
        moduleName: 'openssl',
      },
      staticPreview: this.render({ endorsement: 'approved' }),
    },
  ]

  static defaultBadgeData = { label: 'endorsement' }

  static render({ endorsement }) {
    let color
    if (endorsement === 'approved') {
      color = 'green'
    } else if (endorsement === 'supported') {
      color = 'brightgreen'
    } else {
      color = 'red'
    }
    return { message: endorsement, color }
  }

  async handle({ user, moduleName }) {
    const { endorsement } = await this.fetch({ user, moduleName })
    if (endorsement == null) {
      throw new NotFound({ prettyMessage: 'none' })
    }
    return this.constructor.render({ endorsement })
  }
}
