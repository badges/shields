import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const description = `
[addons.thunderbird.net](https://addons.thunderbird.net) (ATN) publishes
extensions for Mozilla Thunderbird.
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
