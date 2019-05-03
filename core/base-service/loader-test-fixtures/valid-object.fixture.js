'use strict'

const BaseJsonService = require('../base-json')

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
class GoodServiceTwo extends BaseJsonService {
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

module.exports = { GoodServiceOne, GoodServiceTwo }
