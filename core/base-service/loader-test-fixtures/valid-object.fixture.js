import BaseJsonService from '../base-json.js'

class GoodServiceObjectOne extends BaseJsonService {
  static category = 'build'
  static route = { base: 'good', pattern: 'one' }
}
class GoodServiceObjectTwo extends BaseJsonService {
  static category = 'build'
  static route = { base: 'good', pattern: 'two' }
}

export { GoodServiceObjectOne, GoodServiceObjectTwo }
