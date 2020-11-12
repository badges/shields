'use strict'

const Joi = require('joi')
const { optionalNonNegativeInteger } = require('../validators')
const { BaseJsonService, NotFound } = require('..')

const extensionQuerySchema = Joi.object({
  error: Joi.string(),
  version: Joi.string().when('error', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  timestamp: Joi.string().isoDate().when('error', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  downloadCount: optionalNonNegativeInteger,
  reviewCount: optionalNonNegativeInteger,
  averageRating: Joi.number().when('reviewCount', {
    is: Joi.exist(),
    then: Joi.number().max(5),
    otherwise: Joi.optional(),
  }),
}).required()

module.exports = class OpenVSXBase extends BaseJsonService {
  static keywords = [
    'ovsx',
    'open-vsx',
    'ovsx-marketplace',
    'open-vsx-marketplace',
  ]

  static defaultBadgeData = {
    label: 'open vsx',
    color: 'blue',
  }

  async fetch({ namespace, extension, version }) {
    return this._requestJson({
      schema: extensionQuerySchema,
      url: `https://open-vsx.org/api/${namespace}/${extension}/${
        version || ''
      }`,
      errorMessages: {
        400: 'invalid extension id',
      },
    })
  }

  transform({ json }) {
    const { error, version } = json
    if (error || !version) {
      throw new NotFound({
        prettyMessage: 'extension not found',
      })
    }
    return json
  }
}
