import { renderDownloadsBadge } from '../downloads.js'
import { pathParams } from '../index.js'
import {
  BaseTerraformService,
  description,
  intervalMap,
} from './terraform-base.js'

export default class TerraformProviderDownloads extends BaseTerraformService {
  static category = 'downloads'

  static route = {
    base: 'terraform/provider',
    pattern: ':interval(dw|dm|dy|dt)/:providerId',
  }

  static openApi = {
    '/terraform/provider/{interval}/{providerId}': {
      get: {
        summary: 'Terraform Provider Downloads',
        description,
        parameters: pathParams(
          {
            name: 'interval',
            example: 'dy',
            schema: { type: 'string', enum: this.getEnum('interval') },
            description: 'Weekly, Monthly, Yearly or Total downloads',
          },
          {
            name: 'providerId',
            example: '323',
            description:
              'The provider ID can be found using `https://registry.terraform.io/v2/providers/{namespace}/{name}`',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  async handle({ interval, providerId }) {
    const { transform } = intervalMap[interval]
    const json = await this.fetch({
      kind: 'providers',
      object: providerId,
    })

    return renderDownloadsBadge({
      downloads: transform(json),
      interval: intervalMap[interval].interval,
    })
  }
}
