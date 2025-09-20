import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, NotFound, pathParams } from '../index.js'

const ansibleRoleSchema = Joi.object({
  results: Joi.array()
    .items(
      Joi.object({
        download_count: nonNegativeInteger,
      }),
    )
    .required(),
}).required()

export default class AnsibleGalaxyRoleDownloads extends BaseJsonService {
  static category = 'downloads'
  static route = { base: 'ansible/role/d', pattern: ':namespace/:name' }

  static openApi = {
    '/ansible/role/d/{namespace}/{name}': {
      get: {
        summary: 'Ansible Role',
        parameters: pathParams(
          { name: 'namespace', example: 'openwisp' },
          { name: 'name', example: 'openwisp2' },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'role downloads' }

  async fetch({ namespace, name }) {
    const url = 'https://galaxy.ansible.com/api/v1/roles/'
    return this._requestJson({
      url,
      schema: ansibleRoleSchema,
      options: { searchParams: { namespace, name, limit: 1 } },
    })
  }

  async handle({ namespace, name }) {
    const json = await this.fetch({ namespace, name })
    if (json.results.length === 0) {
      throw new NotFound({ prettyMessage: 'not found' })
    }
    return renderDownloadsBadge({ downloads: json.results[0].download_count })
  }
}
