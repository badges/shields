'use strict'

const BaseJsonService = require('../services/base-json')

class GoodService extends BaseJsonService {
  static get category() {
    return 'build'
  }
}

module.exports = GoodService
