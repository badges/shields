import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const ansibleCollectionSchema = Joi.object({
  name: Joi.string().required(),
  namespace: Joi.object({
    name: Joi.string().required(),
  }),
}).required()

class AnsibleGalaxyCollection extends BaseJsonService {
  async fetch({ collectionId }) {
    const url = `https://galaxy.ansible.com/api/v2/collections/${collectionId}/`
    return this._requestJson({
      url,
      schema: ansibleCollectionSchema,
    })
  }
}

class AnsibleGalaxyCollectionName extends AnsibleGalaxyCollection {
  static category = 'other'
  static route = { base: 'ansible/collection', pattern: ':collectionId' }

  static examples = [
    {
      title: 'Ansible Collection',
      namedParams: { collectionId: '278' },
      staticPreview: this.render({
        name: 'community.general',
      }),
    },
  ]

  static defaultBadgeData = { label: 'collection' }

  static render({ name }) {
    return { message: name, color: 'blue' }
  }

  async handle({ collectionId }) {
    const json = await this.fetch({ collectionId })
    const name = `${json.namespace.name}.${json.name}`
    return this.constructor.render({ name })
  }
}

export { AnsibleGalaxyCollectionName }
