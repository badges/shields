'use strict'

const BaseJsonService = require('../base-json')

class GoodServiceOne extends BaseJsonService {
  static category = 'build'
  static route = { base: 'good', pattern: 'one' }
}
class GoodServiceTwo extends BaseJsonService {
  static category = 'build'
  static route = { base: 'good', pattern: 'two' }
}

module.exports = [GoodServiceOne, GoodServiceTwo]
