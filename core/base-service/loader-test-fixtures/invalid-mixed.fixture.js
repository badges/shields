import BaseJsonService from '../base-json.js'

class BadBaseService {}
class GoodMixedService extends BaseJsonService {
  static category = 'build'
  static route = { base: 'it/is', pattern: 'good' }
}
class BadMixedService extends BadBaseService {}

export default [GoodMixedService, BadMixedService]
