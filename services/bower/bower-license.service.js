'use strict'

const { renderLicenseBadge } = require('../licenses')
const BaseBowerService = require('./bower-base')

module.exports = class BowerLicense extends BaseBowerService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'bower/l',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Bower',
        namedParams: { packageName: 'bootstrap' },
        staticPreview: renderLicenseBadge({ licenses: ['MIT'] }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'license' }
  }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    return renderLicenseBadge({ licenses: data.normalized_licenses })
  }
}
