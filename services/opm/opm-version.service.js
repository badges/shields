import { renderVersionBadge } from '../version.js'
import { BaseService, NotFound, InvalidResponse } from '../index.js'

export default class OpmVersion extends BaseService {
  static category = 'version'

  static route = {
    base: 'opm/v',
    pattern: ':user/:moduleName',
  }

  static examples = [
    {
      title: 'OPM',
      namedParams: {
        user: 'openresty',
        moduleName: 'lua-resty-lrucache',
      },
      staticPreview: renderVersionBadge({ version: 'v0.08' }),
    },
  ]

  static defaultBadgeData = {
    label: 'opm',
  }

  async fetch({ user, moduleName }) {
    const { res } = await this._request({
      url: `https://opm.openresty.org/api/pkg/fetch`,
      options: {
        method: 'HEAD',
        searchParams: {
          account: user,
          name: moduleName,
        },
      },
      errorMessages: {
        404: 'module not found',
      },
    })

    // TODO: set followRedirect to false and intercept 302 redirects
    const location = res.redirectUrls[0].toString()
    if (!location) {
      throw new NotFound({ prettyMessage: 'module not found' })
    }
    const version = location.match(`${moduleName}-(.+).opm`)[1]
    if (!version) {
      throw new InvalidResponse({ prettyMessage: 'version invalid' })
    }
    return version
  }

  async handle({ user, moduleName }) {
    const version = await this.fetch({ user, moduleName })

    return renderVersionBadge({ version })
  }
}
