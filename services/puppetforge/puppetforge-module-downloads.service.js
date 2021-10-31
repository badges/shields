import { renderDownloadsBadge } from '../downloads.js'
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
      staticPreview: renderDownloadsBadge({ downloads: 720000 }),
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  async handle({ user, moduleName }) {
    const { downloads } = await this.fetch({ user, moduleName })
    return renderDownloadsBadge({ downloads })
  }
}
