'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')
const { nonNegativeInteger } = require('../validators')

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
  async fetch({ addonId }) {
    return this._requestJson({
      schema,
      url: `https://addons.mozilla.org/api/v3/addons/addon/${addonId}`,
    })
  }

  static get defaultBadgeData() {
    return { label: 'mozilla add-on' }
  }
}

module.exports = { BaseAmoService, keywords }
