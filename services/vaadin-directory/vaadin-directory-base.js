'use strict'

const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  ratingCount: nonNegativeInteger,
  averageRating: Joi.number().min(0).required(),
  latestAvailableRelease: Joi.object({
    publicationDate: Joi.date().required(),
    name: Joi.string().required(),
  }).required(),
  status: Joi.string().required(),
}).required()

class BaseVaadinDirectoryService extends BaseJsonService {
  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://vaadin.com/vaadincom/directory-service/components/search/findByUrlIdentifier`,
      options: {
        qs: {
          projection: 'summary',
          urlIdentifier: packageName,
        },
      },
    })
  }
}

module.exports = { BaseVaadinDirectoryService }
