import Joi from 'joi'
// TODO: add download count class
// import { renderDownloadsBadge } from '../downloads.js'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, deprecatedService, pathParams } from '../index.js'

const ansibleCollectionSchema = Joi.object({
  deprecated: Joi.boolean().required(),
  highest_version: Joi.object({
    version: Joi.string().required(),
  }).required(),
  // Ansible docs don't mention this but it appears in the API responses
  download_count: Joi.number().required(),
}).required()

const AnsibleGalaxyCollectionName = deprecatedService({
  category: 'other',
  route: {
    base: 'ansible/collection',
    pattern: ':collectionId',
  },
  label: 'collection',
  dateAdded: new Date('2023-10-10'),
})

class AnsibleGalaxyCollectionVersion extends BaseJsonService {
  static category = 'downloads'
  static route = { base: 'ansible/collection/v', pattern: ':namespace/:name' }

  static openApi = {
    '/ansible/collection/v/{namespace}/{name}': {
      get: {
        summary: 'Ansible Collection',
        parameters: pathParams(
          { name: 'namespace', example: 'community' },
          { name: 'name', example: 'general' },
        ),
      },
    },
  }

  // Use the collection namespace & name as default label, which aren't statically known
  static defaultBadgeData = {}

  async fetch({ namespace, name }) {
    return this._requestJson({
      schema: ansibleCollectionSchema,
      url: `https://galaxy.ansible.com/api/v3/plugin/ansible/content/published/collections/index/${namespace}/${name}/`,
    })
  }

  async handle({ namespace, name }) {
    const { highest_version } = await this.fetch({ namespace, name })
    return renderVersionBadge({
      defaultLabel: `${namespace}.${name}`,
      version: highest_version.version, // eslint-disable-line camelcase
    })
  }
}

export { AnsibleGalaxyCollectionName, AnsibleGalaxyCollectionVersion }
