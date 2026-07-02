import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const description = `
[addons.thunderbird.net](https://addons.thunderbird.net) (ATN) publishes extensions for Mozilla Thunderbird.

The ATN API is based on the Mozilla addons-server infrastructure. The
[addons-server API overview](https://mozilla.github.io/addons-server/topics/api/overview.html)
does not publish explicit per-endpoint rate limits for read-only addon metadata
requests. Throttled requests return HTTP 429. This badge issues one GET per render
to \`https://addons.thunderbird.net/api/v3/addons/addon/{addonId}/\`.
`

const schema = Joi.object({
  average_daily_users: nonNegativeInteger,
  current_version: Joi.object({
    version: Joi.string().required(),
  }).required(),
  ratings: Joi.object({
    average: Joi.number().required(),
  }).required(),
  weekly_downloads: nonNegativeInteger,
}).required()

class BaseAtnService extends BaseJsonService {
  static defaultBadgeData = { label: 'thunderbird add-on' }

  addonUrl({ addonId }) {
    return `https://addons.thunderbird.net/api/v3/addons/addon/${addonId}/`
  }

  async fetch({ addonId }) {
    return this._requestJson({
      schema,
      url: this.addonUrl({ addonId }),
    })
  }
}

export { BaseAtnService, description }
