'use strict'

const { BaseOreService, documentation, keywords } = require('./ore-base')

module.exports = class OreSpongeVersions extends BaseOreService {
  static category = 'platform-support'

  static route = {
    base: 'ore/sponge-versions',
    pattern: ':pluginId',
  }

  static examples = [
    {
      title: 'Compatible versions (plugins on Ore)',
      namedParams: {
        pluginId: 'nucleus',
      },
      staticPreview: this.render({ versions: ['7.3', '6.0'] }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'for Sponge',
  }

  static render({ versions }) {
    return {
      label: 'for Sponge',
      message: versions.length
        ? versions.join(' | ')
        : 'no sponge versions in tags',
      color: versions.length ? 'blue' : 'lightgrey',
    }
  }

  async handle({ pluginId }) {
    const { promoted_versions } = await this.fetch({ pluginId })

    const versions = promoted_versions
      .reduce((acc, { tags }) => acc.concat(tags), [])
      .filter(({ name }) => name.toLowerCase() === 'sponge')
      .map(({ display_data }) => display_data)
      // display_data is not mandatory in the schema, filter null values
      .filter(x => !!x)

    return this.constructor.render({ versions })
  }
}
