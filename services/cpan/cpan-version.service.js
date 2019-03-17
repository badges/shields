'use strict'

const { renderVersionBadge } = require('../version')
const BaseCpanService = require('./cpan')

module.exports = class CpanVersion extends BaseCpanService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'cpan/v',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'CPAN',
        namedParams: { packageName: 'Config-Augeas' },
        staticPreview: renderVersionBadge({ version: '1.000' }),
        keywords: ['perl'],
      },
    ]
  }

  async handle({ packageName }) {
    const { version } = await this.fetch({ packageName })
    return renderVersionBadge({ version })
  }
}
