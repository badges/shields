import { downloadCount } from '../color-formatters.js'
import { metric } from '../text-formatters.js'
import { BasePuppetForgeModulesService } from './puppetforge-base.js'

export default class PuppetforgeModuleDownloads extends BasePuppetForgeModulesService {
  static category = 'downloads'

  static route = {
    base: 'puppetforge/dt',
    pattern: ':user/:moduleName',
  }

  static examples = [
    {
      title: 'Puppet Forge downloads',
      namedParams: {
        user: 'camptocamp',
        moduleName: 'openldap',
      },
      staticPreview: this.render({ downloads: 720000 }),
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  static render({ downloads }) {
    return {
      message: metric(downloads),
      color: downloadCount(downloads),
    }
  }

  async handle({ user, moduleName }) {
    const data = await this.fetch({ user, moduleName })
    return this.constructor.render({ downloads: data.downloads })
  }
}
