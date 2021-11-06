import { BaseOreService, documentation, keywords } from './ore-base.js'

export default class OreSpongeVersions extends BaseOreService {
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
    label: 'sponge',
  }

  static render({ versions }) {
    if (versions.length === 0) {
      return { message: 'none', color: 'inactive' }
    }
    return { message: versions.join(' | '), color: 'blue' }
  }

  transform({ data }) {
    const { promoted_versions: promotedVersions } = data
    return {
      versions: promotedVersions
        .reduce((acc, { tags }) => acc.concat(tags), [])
        .filter(({ name }) => name.toLowerCase() === 'sponge')
        .map(({ display_data: displayData }) => displayData)
        // display_data is not mandatory in the schema, filter null values
        .filter(x => !!x),
    }
  }

  async handle({ pluginId }) {
    const data = await this.fetch({ pluginId })
    const { versions } = this.transform({ data })
    return this.constructor.render({ versions })
  }
}
