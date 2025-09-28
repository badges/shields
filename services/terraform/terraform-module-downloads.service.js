import { renderDownloadsBadge } from '../downloads.js'
import { pathParams } from '../index.js'
import {
  BaseTerraformService,
  description,
  intervalMap,
} from './terraform-base.js'

export default class TerraformModuleDownloads extends BaseTerraformService {
  static category = 'downloads'

  static route = {
    base: 'terraform/module',
    pattern: ':interval(dw|dm|dy|dt)/:namespace/:name/:provider',
  }

  static openApi = {
    '/terraform/module/{interval}/{namespace}/{name}/{provider}': {
      get: {
        summary: 'Terraform Module Downloads',
        description,
        parameters: pathParams(
          {
            name: 'interval',
            example: 'dy',
            schema: { type: 'string', enum: this.getEnum('interval') },
            description: 'Weekly, Monthly, Yearly or Total downloads',
          },
          {
            name: 'namespace',
            example: 'hashicorp',
          },
          {
            name: 'name',
            example: 'consul',
          },
          {
            name: 'provider',
            example: 'aws',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  async handle({ interval, namespace, name, provider }) {
    const { transform } = intervalMap[interval]
    const json = await this.fetch({
      kind: 'modules',
      object: `${namespace}/${name}/${provider}`,
    })

    return renderDownloadsBadge({
      downloads: transform(json),
      interval: intervalMap[interval].interval,
    })
  }
}
