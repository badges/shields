'use strict'

const BaseJsonService = require('../core/base-service/base-json')
const LegacyService = require('../services/legacy-service')

class GoodServiceOne extends BaseJsonService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'good',
      pattern: 'one',
    }
  }
}
class GoodServiceTwo extends LegacyService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'good',
      pattern: 'two',
    }
  }
}

module.exports = [GoodServiceOne, GoodServiceTwo]
