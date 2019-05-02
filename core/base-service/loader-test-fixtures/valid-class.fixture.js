'use strict'

const BaseJsonService = require('../base-json')

class GoodService extends BaseJsonService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'it/is',
      pattern: 'good',
    }
  }
}

module.exports = GoodService
