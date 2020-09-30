'use strict'

const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')

const condaSchema = Joi.object({
  latest_version: Joi.string().required(),
  conda_platforms: Joi.array().items(Joi.string()).required(),
  files: Joi.array()
    .items(
      Joi.object({
        ndownloads: nonNegativeInteger,
      })
    )
    .required(),
}).required()

module.exports = class BaseCondaService extends BaseJsonService {
  static defaultBadgeData = { label: 'conda' }

  async fetch({ channel, pkg }) {
    return this._requestJson({
      schema: condaSchema,
      url: `https://api.anaconda.org/package/${channel}/${pkg}`,
    })
  }
}
