'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')
const { renderVersionBadge } = require('../../lib/version')

const schema = Joi.object({
  version: Joi.string().required(),
  status: Joi.string()
    .valid('ok')
    .required(),
}).required()

module.exports = class JitPackVersion extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'jitpack/v',
      pattern: ':groupId/:artifactId',
    }
  }

  static get examples() {
    return [
      {
        title: 'JitPack',
        namedParams: {
          groupId: 'jitpack',
          artifactId: 'maven-simple',
        },
        staticPreview: renderVersionBadge({ version: 'v1.1' }),
        keywords: ['java', 'maven'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'jitpack' }
  }

  async fetch({ groupId, artifactId }) {
    return this._requestJson({
      schema,
      url: `https://jitpack.io/api/builds/com.github.${groupId}/${artifactId}/latest`,
      errorMessages: { 401: 'project not found or private' },
    })
  }

  async handle({ groupId, artifactId }) {
    const { version } = await this.fetch({ groupId, artifactId })
    return renderVersionBadge({ version })
  }
}
