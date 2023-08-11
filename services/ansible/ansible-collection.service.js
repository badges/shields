import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'

const ansibleCollectionSchema = Joi.object({
  name: Joi.string().required(),
  namespace: Joi.object({
    name: Joi.string().required(),
  }),
}).required()

class AnsibleGalaxyCollectionName extends BaseJsonService {
  static category = 'other'
  static route = { base: 'ansible/collection', pattern: ':collectionId' }

  static openApi = {
    '/ansible/collection/{collectionId}': {
      get: {
        summary: 'Ansible Collection',
        parameters: pathParams({ name: 'collectionId', example: '278' }),
      },
    },
  }

  static defaultBadgeData = { label: 'collection' }

  static render({ name }) {
    return { message: name, color: 'blue' }
  }

  async fetch({ collectionId }) {
    const url = `https://galaxy.ansible.com/api/v2/collections/${collectionId}/`
    return this._requestJson({
      url,
      schema: ansibleCollectionSchema,
    })
  }

  async handle({ collectionId }) {
    const json = await this.fetch({ collectionId })
    const name = `${json.namespace.name}.${json.name}`
    return this.constructor.render({ name })
  }
}

export { AnsibleGalaxyCollectionName }
