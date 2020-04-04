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
      pattern: ':crate/:version?',
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
      {
        title: 'Crates.io with version',
        namedParams: { crate: 'rustc-serialize', version: '0.3.23'},
        staticPreview: renderVersionBadge({ version: '0.3.23' }),
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

  async handle({ crate, version}) {
    const json = await this.fetch({ crate, version })
    const { fetched_version } = this.transform(json)
    return renderVersionBadge({ fetched_version })
  }
}
