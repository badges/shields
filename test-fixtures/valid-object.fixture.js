'use strict'

const BaseJsonService = require('../core/base-service/base-json')
const LegacyService = require('../services/legacy-service')

class GoodServiceOne extends BaseJsonService {
  static get category() {
    return 'build'
  }

  static get route() {
    return { pattern: 'good/one' }
  }
}
class GoodServiceTwo extends LegacyService {
  static get category() {
    return 'build'
  }

  static get route() {
    return { pattern: 'good/two' }
  }
}

module.exports = { GoodServiceOne, GoodServiceTwo }
