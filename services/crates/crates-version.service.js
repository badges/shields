'use strict'

const { renderVersionBadge } = require('../../lib/version')
const { BaseCratesService, keywords } = require('./crates-base')

module.exports = class CratesVersion extends BaseCratesService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'crates/v',
      pattern: ':crate',
    }
  }

  static get examples() {
    return [
      {
        title: 'Crates.io',
        namedParams: { crate: 'rustc-serialize' },
        staticPreview: this.render({ version: '0.3.24' }),
        keywords,
      },
    ]
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ crate }) {
    const json = await this.fetch({ crate })
    return this.constructor.render({
      version: json.version ? json.version.num : json.crate.max_version,
    })
  }
}
