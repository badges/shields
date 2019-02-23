'use strict'

const Joi = require('joi')
const { BaseStaticService, InvalidParameter } = require('..')

const queryParamSchema = Joi.object({
  message: Joi.string().required(),
}).required()

module.exports = class QueryStringStaticBadge extends BaseStaticService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      format: 'static/v([0-9])',
      capture: ['schemaVersion'],
      // All but one of the parameters are parsed via coalesceBadge. This
      // reuses what is the override behaviour for other badges.
      queryParamSchema,
    }
  }

  handle(namedParams, queryParams) {
    if (namedParams.schemaVersion !== '1') {
      throw new InvalidParameter({ prettyMessage: 'Invalid schemaVersion' })
    }

    return { message: queryParams.message }
  }
}
