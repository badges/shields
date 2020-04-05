'use strict'

const { renderLicenseBadge } = require('../licenses')
const toArray = require('../../core/base-service/to-array')
const BaseCondaService = require('./conda-base')

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
    const json = await this.fetch({ channel, pkg })
    return this.constructor.render({
      licenses: toArray(json.license),
    })
  }
}
