import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { BasePuppetForgeUsersService } from './puppetforge-base.js'

export default class PuppetForgeModuleCountService extends BasePuppetForgeUsersService {
  static category = 'other'

  static route = {
    base: 'puppetforge/mc',
    pattern: ':user',
  }

  static openApi = {
    '/puppetforge/mc/{user}': {
      get: {
        summary: 'Puppet Forge modules by user',
        parameters: pathParams({
          name: 'user',
          example: 'camptocamp',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'modules' }

  static render({ modules }) {
    return {
      message: metric(modules),
      color: floorCountColor(modules, 5, 10, 50),
    }
  }

  async handle({ user }) {
    const data = await this.fetch({ user })
    return this.constructor.render({ modules: data.module_count })
  }
}
