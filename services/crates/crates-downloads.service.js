'use strict'

const { downloadCount: downloadCountColor } = require('../color-formatters')
const { metric } = require('../text-formatters')
const { BaseCratesService, keywords } = require('./crates-base')

module.exports = class CratesDownloads extends BaseCratesService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'crates',
      pattern: ':which(d|dv)/:crate/:version?',
    }
  }

  static get examples() {
    return [
      {
        title: 'Crates.io',
        pattern: ':which(d|dv)/:crate',
        namedParams: { which: 'd', crate: 'rustc-serialize' },
        staticPreview: this.render({ downloads: 5000000 }),
        keywords,
      },
      {
        title: 'Crates.io',
        pattern: ':which(d|dv)/:crate/:version',
        namedParams: {
          which: 'd',
          crate: 'rustc-serialize',
          version: '0.3.24',
        },
        staticPreview: this.render({ downloads: 2000000, version: '0.3.24' }),
        keywords,
      },
    ]
  }

  static _getLabel(version, which) {
    if (version) {
      return `downloads@${version}`
    } else {
      if (which === 'dv') {
        return 'downloads@latest'
      } else {
        return 'downloads'
      }
    }
  }

  static render({ which, downloads, version }) {
    return {
      label: this._getLabel(version, which),
      message: metric(downloads),
      color: downloadCountColor(downloads),
    }
  }

  async handle({ which, crate, version }) {
    const json = await this.fetch({ crate, version })

    if (json.errors) {
      /* a call like
         https://crates.io/api/v1/crates/libc/0.1
         or
         https://crates.io/api/v1/crates/libc/0.1.76
         returns a 200 OK with an errors object */
      return { message: json.errors[0].detail }
    }

    let downloads
    if (which === 'dv') {
      downloads = json.version
        ? json.version.downloads
        : json.versions[0].downloads
    } else {
      downloads = json.crate ? json.crate.downloads : json.version.downloads
    }
    return this.constructor.render({ which, downloads, version })
  }
}
