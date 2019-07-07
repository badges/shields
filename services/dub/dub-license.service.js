'use strict'

const Joi = require('@hapi/joi')
const { renderLicenseBadge } = require('../licenses')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  info: Joi.object({ license: Joi.string().required() }).required(),
})

module.exports = class DubLicense extends BaseJsonService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'dub/l',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'DUB',
        namedParams: { packageName: 'vibe-d' },
        staticPreview: renderLicenseBadge({ licenses: ['MIT'] }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'license' }
  }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://code.dlang.org/api/packages/${packageName}/latest/info`,
    })
  }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    return renderLicenseBadge({ licenses: [data.info.license] })
  }
}
