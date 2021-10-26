import { renderDownloadsBadge } from '../downloads.js'
import { InvalidParameter, NotFound } from '../index.js'
import { BaseCratesService, keywords } from './crates-base.js'

export default class CratesDownloads extends BaseCratesService {
  static category = 'downloads'
  static route = {
    base: 'crates',
    pattern: ':variant(d|dv|dr)/:crate/:version?',
  }

  static examples = [
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

  static render({ variant, downloads, version }) {
    let labelOverride
    if (variant === 'dr') {
      labelOverride = 'recent downloads'
    } else if (variant === 'dv' && !version) {
      version = 'latest'
    } else if (!version) {
      labelOverride = 'downloads'
    }
    return renderDownloadsBadge({ downloads, labelOverride, version })
  }

  transform({ variant, json }) {
    switch (variant) {
      case 'dv':
        return json.crate ? json.versions[0].downloads : json.version.downloads
      case 'dr':
        return json.crate.recent_downloads || 0
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
