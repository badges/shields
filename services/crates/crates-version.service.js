'use strict'

const { version: versionColor } = require('../../lib/color-formatters')
const { addv: versionText } = require('../../lib/text-formatters')
const { BaseCratesService, keywords } = require('./crates-base')

module.exports = class CratesVersion extends BaseCratesService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'crates/v',
      format: '([A-Za-z0-9_-]+)',
      capture: ['crate'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Crates.io',
        pattern: ':crate',
        exampleUrl: 'rustc-serialize',
        staticExample: this.render({ version: '0.3.24' }),
        keywords,
      },
    ]
  }

  static render({ version }) {
    return {
      message: versionText(version),
      color: versionColor(version),
    }
  }

  async handle({ crate }) {
    const json = await this.fetch({ crate })
    return this.constructor.render({
      version: json.version ? json.version.num : json.crate.max_version,
    })
  }
}
