'use strict'

const Joi = require('joi')
const { renderLicenseBadge } = require('../licenses')
const toArray = require('../../core/base-service/to-array')
const BaseCondaService = require('./conda-base')

const schema = Joi.object({
  license: Joi.string().required(),
}).required()

module.exports = class CondaLicense extends BaseCondaService {
  static category = 'license'
  static route = { base: 'conda', pattern: 'l/:channel/:pkg' }

  static examples = [
    {
      title: 'Conda - License',
      pattern: 'l/:channel/:package',
      namedParams: {
        channel: 'conda-forge',
        package: 'setuptools',
      },
      staticPreview: this.render({
        variant: 'l',
        channel: 'conda-forge',
        licenses: ['MIT'],
      }),
    },
  ]

  static defaultBadgeData = { label: 'license' }

  static render({ licenses }) {
    return renderLicenseBadge({ licenses })
  }

  async handle({ channel, pkg }) {
    const json = await this._requestJson({
      schema,
      url: `https://api.anaconda.org/package/${channel}/${pkg}`,
    })
    return this.constructor.render({
      licenses: toArray(json.license),
    })
  }
}
