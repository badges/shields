import BaseJsonService from '../base-json.js'

class BadBaseService {}
class GoodService extends BaseJsonService {
  static category = 'build'
  static route = { base: 'it/is', pattern: 'good' }
}
class BadService extends BadBaseService {}

export default [GoodService, BadService]
