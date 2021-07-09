import { renderLicenseBadge } from '../licenses.js'
import { BaseOreService, documentation, keywords } from './ore-base.js'

export default class OreLicense extends BaseOreService {
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
    return renderLicenseBadge({ license })
  }

  transform({ data }) {
    const {
      settings: {
        license: { name, url },
      },
    } = data
    /* license: { name: '', url: 'https://donationstore.net/legal/eula' }
    encountered in the wild */
    return { license: name || (url ? 'custom' : null) || undefined }
  }

  async handle({ pluginId }) {
    const data = await this.fetch({ pluginId })
    const { license } = this.transform({ data })
    return this.constructor.render({ license })
  }
}
