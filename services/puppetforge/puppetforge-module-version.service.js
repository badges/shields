'use strict'

const { renderVersionBadge } = require('../version')
const { BasePuppetForgeModulesService } = require('./puppetforge-base')

module.exports = class PuppetforgeModuleVersion extends (
  BasePuppetForgeModulesService
) {
  static category = 'version'

  static route = {
    base: 'puppetforge/v',
    pattern: ':user/:moduleName',
  }

  static examples = [
    {
      title: 'Puppet Forge version',
      namedParams: {
        user: 'vStone',
        moduleName: 'percona',
      },
      staticPreview: renderVersionBadge({ version: '1.3.3' }),
    },
  ]

  static defaultBadgeData = { label: 'puppetforge' }

  async handle({ user, moduleName }) {
    const data = await this.fetch({ user, moduleName })
    return renderVersionBadge({ version: data.current_release.version })
  }
}
