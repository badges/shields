import { renderVersionBadge } from '../version.js'
import { NotFound, pathParams } from '../index.js'
import { BasePuppetForgeModulesService } from './puppetforge-base.js'

export default class PuppetforgeModulePdkVersion extends BasePuppetForgeModulesService {
  static category = 'platform-support'

  static route = {
    base: 'puppetforge/pdk-version',
    pattern: ':user/:moduleName',
  }

  static openApi = {
    '/puppetforge/pdk-version/{user}/{moduleName}': {
      get: {
        summary: 'Puppet Forge - PDK version',
        parameters: pathParams(
          {
            name: 'user',
            example: 'tragiccode',
          },
          {
            name: 'moduleName',
            example: 'azure_key_vault',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'pdk version' }

  async handle({ user, moduleName }) {
    const data = await this.fetch({ user, moduleName })
    if (data.current_release.pdk) {
      return renderVersionBadge({
        version: data.current_release.metadata['pdk-version'],
      })
    } else {
      throw new NotFound({ prettyMessage: 'none' })
    }
  }
}
