import BaseJsonService from '../base-json.js'

class GoodServiceArrayOne extends BaseJsonService {
  static category = 'build'
  static route = { base: 'good', pattern: 'one' }
}
class GoodServiceArrayTwo extends BaseJsonService {
  static category = 'build'
  static route = { base: 'good', pattern: 'two' }
}

export default [GoodServiceArrayOne, GoodServiceArrayTwo]
