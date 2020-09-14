'use strict'

const BaseJsonService = require('../base-json')

class GoodService extends BaseJsonService {
  static category = 'build'
  static route = { base: 'it/is', pattern: 'good' }
}

module.exports = GoodService
