'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')

const schema = Joi.array()
  .items(
    Joi.object({
      build_status: Joi.boolean().required(),
    })
  )
  .min(1)
  .required()

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

  static defaultBadgeData = {}

  static render({ buildStatus, version }) {
    if (buildStatus) {
      return {
        label: `docs@${version}`,
        message: 'passing',
        color: 'success',
      }
    } else {
      return {
        label: `docs@${version}`,
        message: 'failing',
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

  async handle({ crate, version = 'latest' }) {
    const { build_status: buildStatus } = (
      await this.fetch({ crate, version })
    ).pop()
    return this.constructor.render({ version, buildStatus })
  }
}
