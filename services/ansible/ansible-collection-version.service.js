import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, pathParams } from '../index.js'

const ansibleCollectionSchema = Joi.object({
  highest_version: Joi.object({
    version: Joi.string().required(),
  }).required(),
}).required()

export default class AnsibleGalaxyCollectionVersion extends BaseJsonService {
  static category = 'version'
  static route = { base: 'ansible/collection/v', pattern: ':namespace/:name' }

  static openApi = {
    '/ansible/collection/v/{namespace}/{name}': {
      get: {
        summary: 'Ansible Collection Version',
        parameters: pathParams(
          { name: 'namespace', example: 'community' },
          { name: 'name', example: 'general' },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'galaxy' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async fetch({ namespace, name }) {
    return this._requestJson({
      schema: ansibleCollectionSchema,
      url: `https://galaxy.ansible.com/api/v3/plugin/ansible/content/published/collections/index/${namespace}/${name}/`,
    })
  }

  async handle({ namespace, name }) {
    const { highest_version: highestVersion } = await this.fetch({
      namespace,
      name,
    })
    return this.constructor.render({ version: highestVersion.version })
  }
}
