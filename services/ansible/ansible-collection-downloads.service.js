import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { BaseJsonService, pathParams } from '../index.js'

const ansibleCollectionSchema = Joi.object({
  deprecated: Joi.boolean(),
  highest_version: Joi.object({
    version: Joi.string(),
  }),
  // Ansible docs don't mention this but it appears in the API responses
  download_count: Joi.number().required(),
}).required()

export default class AnsibleGalaxyCollectionDownloads extends BaseJsonService {
  static category = 'downloads'
  static route = { base: 'ansible/collection/d', pattern: ':namespace/:name' }

  static openApi = {
    '/ansible/collection/d/{namespace}/{name}': {
      get: {
        summary: 'Ansible Collection Downloads',
        parameters: pathParams(
          { name: 'namespace', example: 'community' },
          { name: 'name', example: 'general' },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'collection downloads' }

  static render({ downloads }) {
    return renderDownloadsBadge({ downloads })
  }

  async fetch({ namespace, name }) {
    return this._requestJson({
      schema: ansibleCollectionSchema,
      url: `https://galaxy.ansible.com/api/v3/plugin/ansible/content/published/collections/index/${namespace}/${name}/`,
    })
  }

  async handle({ namespace, name }) {
    const { download_count: downloads } = await this.fetch({
      namespace,
      name,
    })
    return this.constructor.render({ downloads })
  }
}
