'use strict'

const Joi = require('joi')
const { BaseStaticService } = require('..')

const queryParamSchema = Joi.object({
  message: Joi.string().required(),
}).required()

module.exports = class QueryStringStaticBadge extends BaseStaticService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      pattern: 'static/:schemaVersion(v1)',
      // All but one of the parameters are parsed via coalesceBadge. This
      // reuses what is the override behaviour for other badges.
      queryParamSchema,
    }
  }

  handle(namedParams, queryParams) {
    return { message: queryParams.message }
  }
}
