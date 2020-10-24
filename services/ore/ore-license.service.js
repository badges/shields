'use strict'

const { BaseOreService, documentation, keywords } = require('./ore-base')

module.exports = class OreLicense extends BaseOreService {
  static category = 'license'

  static route = {
    base: 'ore/l',
    pattern: ':pluginId',
  }

  static examples = [
    {
      title: 'Ore License',
      namedParams: {
        pluginId: 'nucleus',
      },
      staticPreview: this.render({ license: 'MIT' }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'license',
  }

  static render({ license }) {
    return {
      label: 'license',
      message: license || 'no license specified',
      color: license ? 'blue' : 'lightgrey',
    }
  }

  async handle({ pluginId }) {
    const { settings } = await this.fetch({ pluginId })
    const { license } = settings
    const { name } = license
    return this.constructor.render({ license: name })
  }
}
