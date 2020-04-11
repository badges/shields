'use strict'

const Joi = require('@hapi/joi')
const { renderLicenseBadge } = require('../licenses')
const toArray = require('../../core/base-service/to-array')
const BaseCondaService = require('./conda-base')

const schema = Joi.object({
  license: Joi.string().required(),
}).required()

module.exports = class CondaLicense extends BaseCondaService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'conda',
      pattern: 'l/:channel/:pkg',
    }
  }

  static get examples() {
    return [
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
  }

  static get defaultBadgeData() {
    return { label: 'license' }
  }

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
