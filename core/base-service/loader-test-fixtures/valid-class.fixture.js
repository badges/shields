import BaseJsonService from '../base-json.js'

class GoodService extends BaseJsonService {
  static category = 'build'
  static route = { base: 'it/is', pattern: 'good' }
}

export default GoodService
