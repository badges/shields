import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const keywords = ['amo', 'firefox']

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

class BaseAmoService extends BaseJsonService {
  static defaultBadgeData = { label: 'mozilla add-on' }

  async fetch({ addonId }) {
    return this._requestJson({
      schema,
      url: `https://addons.mozilla.org/api/v4/addons/addon/${addonId}/`,
    })
  }
}

export { BaseAmoService, keywords }
