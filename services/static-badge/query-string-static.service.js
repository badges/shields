'use strict'

const Joi = require('@hapi/joi')
const { BaseStaticService } = require('..')

const queryParamSchema = Joi.object({
  message: Joi.string().required(),
}).required()

module.exports = class QueryStringStaticBadge extends BaseStaticService {
  static get category() {
    return 'static'
  }

  static get route() {
    return {
      base: '',
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
