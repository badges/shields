import { pathParams } from '../index.js'
import { renderLicenseBadge } from '../licenses.js'
import { BaseOreService, description } from './ore-base.js'

export default class OreLicense extends BaseOreService {
  static category = 'license'

  static route = {
    base: 'ore/l',
    pattern: ':pluginId',
  }

  static openApi = {
    '/ore/l/{pluginId}': {
      get: {
        summary: 'Ore License',
        description,
        parameters: pathParams({
          name: 'pluginId',
          example: 'nucleus',
        }),
      },
    },
  }

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
