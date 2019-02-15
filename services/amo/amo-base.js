'use strict'

const Joi = require('joi')
const { BaseXmlService } = require('..')
const { nonNegativeInteger } = require('../validators')

const keywords = ['amo', 'firefox']

const schema = Joi.object({
  addon: Joi.object({
    total_downloads: nonNegativeInteger,
    rating: nonNegativeInteger,
    daily_users: nonNegativeInteger,
    version: Joi.string().required(),
  }).required(),
}).required()

class BaseAmoService extends BaseXmlService {
  async fetch({ addonId }) {
    return this._requestXml({
      schema,
      url: `https://services.addons.mozilla.org/api/1.5/addon/${addonId}`,
    })
  }

  static get defaultBadgeData() {
    return { label: 'mozilla add-on' }
  }
}

module.exports = { BaseAmoService, keywords }
