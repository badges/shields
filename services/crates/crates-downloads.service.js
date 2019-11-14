'use strict'

const { downloadCount: downloadCountColor } = require('../color-formatters')
const { metric } = require('../text-formatters')
const { BaseCratesService, keywords } = require('./crates-base')
const { InvalidParameter, NotFound } = require('..')

module.exports = class CratesDownloads extends BaseCratesService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'crates',
      pattern: ':variant(d|dv|dr)/:crate/:version?',
    }
  }

  static get examples() {
    return [
      {
        title: 'Crates.io',
        pattern: 'd/:crate',
        namedParams: {
          crate: 'rustc-serialize',
        },
        staticPreview: this.render({ variant: 'd', downloads: 5000000 }),
        keywords,
      },
      {
        title: 'Crates.io (latest)',
        pattern: 'dv/:crate',
        namedParams: {
          crate: 'rustc-serialize',
        },
        staticPreview: this.render({ variant: 'dv', downloads: 2000000 }),
        keywords,
      },
      {
        title: 'Crates.io (version)',
        pattern: 'dv/:crate/:version',
        namedParams: {
          crate: 'rustc-serialize',
          version: '0.3.24',
        },
        staticPreview: this.render({
          variant: 'dv',
          downloads: 2000000,
          version: '0.3.24',
        }),
        keywords,
      },
      {
        title: 'Crates.io (recent)',
        pattern: 'dr/:crate',
        namedParams: {
          crate: 'rustc-serialize',
        },
        staticPreview: this.render({ variant: 'dr', downloads: 2000000 }),
        keywords,
      },
    ]
  }

  static _getLabel(version, variant) {
    switch (variant) {
      case 'dv':
        return version ? `downloads@${version}` : 'downloads@latest'
      case 'dr':
        return 'recent downloads'
      default:
        return version ? `downloads@${version}` : 'downloads'
    }
  }

  static render({ variant, downloads, version }) {
    return {
      label: this._getLabel(version, variant),
      message: metric(downloads),
      color: downloadCountColor(downloads),
    }
  }

  transform({ variant, json }) {
    switch (variant) {
      case 'dv':
        return json.crate ? json.versions[0].downloads : json.version.downloads
      case 'dr':
        return json.crate.recent_downloads
      default:
        return json.crate ? json.crate.downloads : json.version.downloads
    }
  }

  async handle({ variant, crate, version }) {
    if (variant === 'dr' && version) {
      /* crates.io doesn't currently expose
         recent download counts for individual
         versions */
      throw new InvalidParameter({
        prettyMessage: 'recent downloads not supported for specific versions',
      })
    }

    const json = await this.fetch({ crate, version })

    if (json.errors) {
      /* a call like
         https://crates.io/api/v1/crates/libc/0.1
         or
         https://crates.io/api/v1/crates/libc/0.1.76
         returns a 200 OK with an errors object */
      throw new NotFound({ prettyMessage: json.errors[0].detail })
    }

    const downloads = this.transform({ variant, json })

    return this.constructor.render({ variant, downloads, version })
  }
}
