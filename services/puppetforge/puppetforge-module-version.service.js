import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { BasePuppetForgeModulesService } from './puppetforge-base.js'

export default class PuppetforgeModuleVersion extends BasePuppetForgeModulesService {
  static category = 'version'

  static route = {
    base: 'puppetforge/v',
    pattern: ':user/:moduleName',
  }

  static openApi = {
    '/puppetforge/v/{user}/{moduleName}': {
      get: {
        summary: 'Puppet Forge version',
        parameters: pathParams(
          {
            name: 'user',
            example: 'vStone',
          },
          {
            name: 'moduleName',
            example: 'percona',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'puppetforge' }

  async handle({ user, moduleName }) {
    const data = await this.fetch({ user, moduleName })
    return renderVersionBadge({ version: data.current_release.version })
  }
}
