'use strict'

const { renderVersionBadge } = require('../version')
const { BaseCratesService, keywords } = require('./crates-base')
const { InvalidResponse } = require('..')

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
        staticPreview: renderVersionBadge({ version: '0.3.24' }),
        keywords,
      },
    ]
  }

  transform(json) {
    if (json.errors) {
      throw new InvalidResponse({ prettyMessage: json.errors[0].detail })
    }
    return { version: json.version ? json.version.num : json.crate.max_version }
  }

  async handle({ crate }) {
    const json = await this.fetch({ crate })
    const { version } = this.transform(json)
    return renderVersionBadge({ version })
  }
}
