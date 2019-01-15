'use strict'

const BaseJsonService = require('../services/base-json')
const LegacyService = require('../services/legacy-service')

class GoodServiceOne extends BaseJsonService {
  static get category() {
    return 'build'
  }
}
class GoodServiceTwo extends LegacyService {
  static get category() {
    return 'build'
  }
}

module.exports = { GoodServiceOne, GoodServiceTwo }
