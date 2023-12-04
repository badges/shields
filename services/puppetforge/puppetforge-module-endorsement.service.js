import { NotFound, pathParams } from '../index.js'
import { BasePuppetForgeModulesService } from './puppetforge-base.js'

export default class PuppetforgeModuleEndorsement extends BasePuppetForgeModulesService {
  static category = 'rating'

  static route = {
    base: 'puppetforge/e',
    pattern: ':user/:moduleName',
  }

  static openApi = {
    '/puppetforge/e/{user}/{moduleName}': {
      get: {
        summary: 'Puppet Forge endorsement',
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
