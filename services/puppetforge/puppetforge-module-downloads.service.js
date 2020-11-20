'use strict'

const { downloadCount } = require('../color-formatters')
const { metric } = require('../text-formatters')
const { BasePuppetForgeModulesService } = require('./puppetforge-base')

module.exports = class PuppetforgeModuleDownloads extends (
  BasePuppetForgeModulesService
) {
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
