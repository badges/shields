'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { floorCount } = require('../../lib/color-formatters')

const ansibleContentSchema = Joi.object({
  quality_score: Joi.number().required(),
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

class AnsibleGalaxyContentQualityScore extends AnsibleGalaxyContent {
  static render({ qualityScore }) {
    return {
      message: qualityScore,
      color: floorCount(qualityScore, 2, 3, 4),
    }
  }

  async handle({ projectId }) {
    const json = await this.fetch({ projectId })
    return this.constructor.render({ qualityScore: json.quality_score })
  }

  static get defaultBadgeData() {
    return { label: 'quality' }
  }

  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'ansible/score/q',
      pattern: ':projectId',
    }
  }

  static get examples() {
    return [
      {
        title: `Ansible Score Quality`,
        pattern: ':projectId',
        exampleUrl: ':projectId',
        staticExample: this.render({ qualityScore: 4.125 }),
      },
    ]
  }
}

module.exports = {
  AnsibleGalaxyContentQualityScore,
}
