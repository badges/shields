'use strict'

const { BaseStaticService, InvalidParameter } = require('..')

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
      queryParams: ['message'],
    }
  }

  handle(namedParams, queryParams) {
    if (namedParams.schemaVersion !== '1') {
      throw new InvalidParameter({ prettyMessage: 'Invalid schemaVersion' })
    }

    return { message: queryParams.message }
  }
}
