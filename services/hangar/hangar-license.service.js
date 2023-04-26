import { renderLicenseBadge } from '../licenses.js'
import { BaseHangarService, documentation, keywords } from './hangar-base.js'

export default class HangarLicense extends BaseHangarService {
  static category = 'license'

  static route = {
    base: 'hangar/l',
    pattern: ':author/:slug',
  }

  static examples = [
    {
      title: 'Hangar License',
      namedParams: {
        author: 'EssentialsX',
        slug: 'Essentials',
      },
      staticPreview: this.render({ license: 'GPL' }),
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

  async handle({ author, slug }) {
    const data = await this.fetch({ author, slug })
    const { license } = this.transform({ data })
    return this.constructor.render({ license })
  }
}
