import { BaseJsonService, pathParams } from '../index.js'
import { fetchEndpointData } from '../endpoint-common.js'

class FeedzVersionService extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'feedz',
    pattern: ':variant(v|vpre)/:organization/:repository/:packageName',
  }

  static openApi = {
    '/feedz/{variant}/{organization}/{repository}/{packageName}': {
      get: {
        summary: 'Feedz Version',
        parameters: pathParams(
          {
            name: 'variant',
            example: 'v',
            description: 'version or version including pre-releases',
            schema: { type: 'string', enum: this.getEnum('variant') },
          },
          {
            name: 'organization',
            example: 'shieldstests',
          },
          {
            name: 'repository',
            example: 'mongodb',
          },
          {
            name: 'packageName',
            example: 'MongoDB.Driver.Core',
          },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'feedz',
  }

  shieldUrl({ organization, repository, packageName, variant }) {
    const endpoint = variant === 'vpre' ? 'latest' : 'stable'
    return `https://f.feedz.io/${organization}/${repository}/shield/${packageName}/${endpoint}`
  }

  async handle({ variant, organization, repository, packageName }) {
    const url = this.shieldUrl({
      organization,
      repository,
      packageName,
      variant,
    })
    const badgeData = await fetchEndpointData(this, {
      url,
      httpErrors: {
        404: 'repository or package not found',
      },
      validationPrettyErrorMessage: 'invalid response from feedz.io',
    })

    // Feedz.io returns badge data, but we need to:
    // 1. Override label to match existing behavior ('feedz' instead of 'feedz.io')
    // 2. Add 'v' prefix to message if not already present
    let message = badgeData.message
    if (message && !message.startsWith('v')) {
      message = `v${message}`
    }

    return {
      label: FeedzVersionService.defaultBadgeData.label,
      message,
      color: badgeData.color,
      logoSvg: badgeData.logoSvg,
    }
  }
}

export { FeedzVersionService }
