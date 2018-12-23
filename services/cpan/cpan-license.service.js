'use strict'

const BaseCpanService = require('./cpan')

module.exports = class CpanLicense extends BaseCpanService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'cpan/l',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'CPAN',
        namedParams: { packageName: 'Config-Augeas' },
        staticPreview: this.render({ license: 'lgpl_2_1' }),
        keywords: ['perl'],
      },
    ]
  }

  static render({ license }) {
    return {
      label: 'license',
      message: license,
      color: 'blue',
    }
  }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    return this.constructor.render({ license: data.license[0] })
  }
}
