'use strict'

const {
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters')
const { metric } = require('../../lib/text-formatters')
const { BaseCratesService, keywords } = require('./crates-base')

module.exports = class CratesDownloads extends BaseCratesService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'crates',
      format: '(d|dv)/([A-Za-z0-9_-]+)(?:/([0-9.]+))?',
      capture: ['which', 'crate', 'version'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Crates.io',
        pattern: 'd/:crate',
        exampleUrl: 'd/rustc-serialize',
        staticExample: this.render({ downloads: 5000000 }),
        keywords,
      },
      {
        title: 'Crates.io',
        pattern: 'd/:crate/:version',
        exampleUrl: 'd/rustc-serialize/0.3.24',
        staticExample: this.render({ downloads: 2000000, version: '0.3.24' }),
        keywords,
      },
      {
        title: 'Crates.io',
        pattern: 'dv/:crate',
        exampleUrl: 'dv/rustc-serialize',
        staticExample: this.render({ which: 'dv', downloads: 2000000 }),
        keywords,
      },
      {
        title: 'Crates.io',
        pattern: 'dv/:crate/:version',
        exampleUrl: 'dv/rustc-serialize/0.3.24',
        staticExample: this.render({
          which: 'dv',
          downloads: 2000000,
          version: '0.3.24',
        }),
        keywords,
      },
    ]
  }

  static render({ which, downloads, version }) {
    const defaultSuffix = which === 'dv' ? ' latest version' : ''
    return {
      label: 'downloads',
      message:
        metric(downloads) + (version ? ` version ${version}` : defaultSuffix),
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
