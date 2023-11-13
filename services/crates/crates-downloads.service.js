import { renderDownloadsBadge } from '../downloads.js'
import { InvalidParameter, NotFound, pathParams } from '../index.js'
import { BaseCratesService, description } from './crates-base.js'

export default class CratesDownloads extends BaseCratesService {
  static category = 'downloads'
  static route = {
    base: 'crates',
    pattern: ':variant(d|dv|dr)/:crate/:version?',
  }

  static openApi = {
    '/crates/d/{crate}': {
      get: {
        summary: 'Crates.io Total Downloads',
        description,
        parameters: pathParams({
          name: 'crate',
          example: 'rustc-serialize',
        }),
      },
    },
    '/crates/dv/{crate}': {
      get: {
        summary: 'Crates.io Downloads (latest version)',
        description,
        parameters: pathParams({
          name: 'crate',
          example: 'rustc-serialize',
        }),
      },
    },
    '/crates/dv/{crate}/{version}': {
      get: {
        summary: 'Crates.io Downloads (version)',
        description,
        parameters: pathParams(
          {
            name: 'crate',
            example: 'rustc-serialize',
          },
          {
            name: 'version',
            example: '0.3.24',
          },
        ),
      },
    },
    '/crates/dr/{crate}': {
      get: {
        summary: 'Crates.io Downloads (recent)',
        description,
        parameters: pathParams({
          name: 'crate',
          example: 'rustc-serialize',
        }),
      },
    },
  }

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
