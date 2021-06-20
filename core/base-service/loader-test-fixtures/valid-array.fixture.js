import BaseJsonService from '../base-json.js'

class GoodServiceOne extends BaseJsonService {
  static category = 'build'
  static route = { base: 'good', pattern: 'one' }
}
class GoodServiceTwo extends BaseJsonService {
  static category = 'build'
  static route = { base: 'good', pattern: 'two' }
}

export default [GoodServiceOne, GoodServiceTwo]
