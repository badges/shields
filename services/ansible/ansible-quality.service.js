import Joi from 'joi'
import { floorCount } from '../color-formatters.js'
import { BaseJsonService, InvalidResponse, pathParams } from '../index.js'

const ansibleContentSchema = Joi.object({
  quality_score: Joi.number().allow(null).required(),
}).required()

class AnsibleGalaxyContent extends BaseJsonService {
  async fetch({ projectId }) {
    const url = `https://galaxy.ansible.com/api/v1/content/${projectId}/`
    return this._requestJson({
      url,
      schema: ansibleContentSchema,
    })
  }
}

export default class AnsibleGalaxyContentQualityScore extends AnsibleGalaxyContent {
  static category = 'analysis'
  static route = { base: 'ansible/quality', pattern: ':projectId' }

  static openApi = {
    '/ansible/quality/{projectId}': {
      get: {
        summary: 'Ansible Quality Score',
        parameters: pathParams({ name: 'projectId', example: '432' }),
      },
    },
  }

  static defaultBadgeData = { label: 'quality' }

  static render({ qualityScore }) {
    return {
      message: qualityScore,
      color: floorCount(qualityScore, 2, 3, 4),
    }
  }

  async handle({ projectId }) {
    const { quality_score: qualityScore } = await this.fetch({ projectId })

    if (qualityScore === null) {
      throw new InvalidResponse({
        prettyMessage: 'no score available',
      })
    }

    return this.constructor.render({ qualityScore })
  }
}
