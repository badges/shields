'use strict'

const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')

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
      url: `https://addons.mozilla.org/api/v3/addons/addon/${addonId}`,
    })
  }
}

module.exports = { BaseAmoService, keywords }
