import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { BasePuppetForgeUsersService } from './puppetforge-base.js'

export default class PuppetForgeReleaseCountService extends BasePuppetForgeUsersService {
  static category = 'other'

  static route = {
    base: 'puppetforge/rc',
    pattern: ':user',
  }

  static openApi = {
    '/puppetforge/rc/{user}': {
      get: {
        summary: 'Puppet Forge releases by user',
        parameters: pathParams({
          name: 'user',
          example: 'camptocamp',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'releases' }

  static render({ releases }) {
    return {
      message: metric(releases),
      color: floorCountColor(releases, 10, 50, 100),
    }
  }

  async handle({ user }) {
    const data = await this.fetch({ user })
    return this.constructor.render({ releases: data.release_count })
  }
}
