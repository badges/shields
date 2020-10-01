'use strict'

const Joi = require('joi')
const { renderLicenseBadge } = require('../licenses')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  info: Joi.object({ license: Joi.string().required() }).required(),
})

module.exports = class DubLicense extends BaseJsonService {
  static category = 'license'
  static route = { base: 'dub/l', pattern: ':packageName' }
  static examples = [
    {
      title: 'DUB',
      namedParams: { packageName: 'vibe-d' },
      staticPreview: renderLicenseBadge({ licenses: ['MIT'] }),
    },
  ]

  static defaultBadgeData = { label: 'license' }

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
