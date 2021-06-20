import { BaseSpigetService, documentation, keywords } from './spiget-base.js'

export default class SpigetTestedVersions extends BaseSpigetService {
  static category = 'platform-support'

  static route = {
    base: 'spiget/tested-versions',
    pattern: ':resourceId',
  }

  static examples = [
    {
      title: 'Spiget tested server versions',
      namedParams: {
        resourceId: '9089',
      },
      staticPreview: this.render({ versions: '1.7-1.13' }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'tested versions',
    color: 'blue',
  }

  static render({ versions }) {
    return {
      message: versions,
    }
  }

  transform({ testedVersions }) {
    const earliest = testedVersions[0]
    const latest = testedVersions.slice(-1)[0]
    let versions = ''
    if (earliest === latest) {
      versions = earliest
    } else {
      versions = `${earliest}-${latest}`
    }
    return { versions }
  }

  async handle({ resourceId }) {
    const { testedVersions } = await this.fetch({ resourceId })
    const { versions } = this.transform({ testedVersions })
    return this.constructor.render({ versions })
  }
}
