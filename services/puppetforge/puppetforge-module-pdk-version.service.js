'use strict'

const { renderVersionBadge } = require('../version')
const { BasePuppetForgeModulesService } = require('./puppetforge-base')
const { NotFound } = require('..')

module.exports = class PuppetforgeModulePdkVersion extends BasePuppetForgeModulesService {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return {
      base: 'puppetforge/pdk-version',
      pattern: ':user/:moduleName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Puppet Forge – PDK version',
        namedParams: {
          user: 'tragiccode',
          moduleName: 'azure_key_vault',
        },
        staticPreview: renderVersionBadge({ version: '1.7.1' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'pdk version' }
  }

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
