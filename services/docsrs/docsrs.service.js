'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  build_status: Joi.boolean().required(),
}).required()

module.exports = class DocsRs extends BaseJsonService {
  static category = 'build'
  static route = { base: 'docsrs', pattern: ':crate/:version?' }
  static examples = [
    {
      title: 'docs.rs',
      namedParams: { crate: 'regex', version: 'latest' },
      staticPreview: this.render({ version: 'latest', buildStatus: true }),
      keywords: ['rust'],
    },
  ]

  static defaultBadgeData = { label: 'docs' }

  static render({ buildStatus, version }) {
    if (buildStatus) {
      return {
        message: version,
        color: 'success',
      }
    } else {
      return {
        message: `${version} | failed`,
        color: 'critical',
        isError: true,
      }
    }
  }

  async fetch({ crate, version }) {
    return await this._requestJson({
      schema,
      url: `https://docs.rs/crate/${crate}/${version}/builds.json`,
    })
  }

  async handle({ crate, version }) {
    if (version === undefined) {
      version = 'latest'
    }
    const { build_status: buildStatus } = await this.fetch({ crate, version })
    return this.constructor.render({ version, buildStatus })
  }
}
