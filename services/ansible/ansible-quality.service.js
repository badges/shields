'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { floorCount } = require('../../lib/color-formatters')
const { InvalidResponse } = require('../errors')

const ansibleContentSchema = Joi.object({
  quality_score: Joi.number()
    .allow(null)
    .required(),
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

module.exports = class AnsibleGalaxyContentQualityScore extends AnsibleGalaxyContent {
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

  static get defaultBadgeData() {
    return { label: 'quality' }
  }

  static get category() {
    return 'analysis'
  }

  static get route() {
    return {
      base: 'ansible/quality',
      pattern: ':projectId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Ansible Quality Score',
        namedParams: {
          projectId: '432',
        },
        staticPreview: this.render({ qualityScore: 4.125 }),
      },
    ]
  }
}
