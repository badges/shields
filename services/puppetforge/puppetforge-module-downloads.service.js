import { pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'
import { BasePuppetForgeModulesService } from './puppetforge-base.js'

export default class PuppetforgeModuleDownloads extends BasePuppetForgeModulesService {
  static category = 'downloads'

  static route = {
    base: 'puppetforge/dt',
    pattern: ':user/:moduleName',
  }

  static openApi = {
    '/puppetforge/dt/{user}/{moduleName}': {
      get: {
        summary: 'Puppet Forge downloads',
        parameters: pathParams(
          {
            name: 'user',
            example: 'camptocamp',
          },
          {
            name: 'moduleName',
            example: 'openldap',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  async handle({ user, moduleName }) {
    const { downloads } = await this.fetch({ user, moduleName })
    return renderDownloadsBadge({ downloads })
  }
}
