'use strict'

const { renderVersionBadge } = require('../version')
const { NotFound } = require('..')
const { BasePuppetForgeModulesService } = require('./puppetforge-base')

module.exports = class PuppetforgeModulePdkVersion extends (
  BasePuppetForgeModulesService
) {
  static category = 'platform-support'

  static route = {
    base: 'puppetforge/pdk-version',
    pattern: ':user/:moduleName',
  }

  static examples = [
    {
      title: 'Puppet Forge – PDK version',
      namedParams: {
        user: 'tragiccode',
        moduleName: 'azure_key_vault',
      },
      staticPreview: renderVersionBadge({ version: '1.7.1' }),
    },
  ]

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
