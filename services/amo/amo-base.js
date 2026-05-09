import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const registryMap = {
  firefox: 'https://addons.mozilla.org/api/v4',
  thunderbird: 'https://addons.thunderbird.net/api/v5',
}

const description =
  'Supports [addons.mozilla.org](https://addons.mozilla.org) (Mozilla Firefox) and ' +
  '[addons.thunderbird.net](https://addons.thunderbird.net) (Mozilla Thunderbird). ' +
  'Use `?registry=thunderbird` for Thunderbird add-ons.'

const queryParamSchema = Joi.object({
  registry: Joi.string().valid('firefox', 'thunderbird').default('firefox'),
}).required()

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

  async fetch({ addonId, registry = 'firefox' }) {
    const apiUrl = registryMap[registry]
    return this._requestJson({
      schema,
      url: `${apiUrl}/addons/addon/${addonId}/`,
    })
  }
}

export { BaseAmoService, description, queryParamSchema }
