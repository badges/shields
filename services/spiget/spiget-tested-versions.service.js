import { pathParams } from '../index.js'
import { BaseSpigetService, description } from './spiget-base.js'

export default class SpigetTestedVersions extends BaseSpigetService {
  static category = 'platform-support'

  static route = {
    base: 'spiget/tested-versions',
    pattern: ':resourceId',
  }

  static openApi = {
    '/spiget/tested-versions/{resourceId}': {
      get: {
        summary: 'Spiget tested server versions',
        description,
        parameters: pathParams({
          name: 'resourceId',
          example: '9089',
        }),
      },
    },
  }

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
