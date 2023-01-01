import { BaseJsonService } from '../index.js'

export default class BaseCoincapService extends BaseJsonService {
  static category = 'other'

  static defaultBadgeData = { label: 'coincap' }

  // Doc this API. From https://docs.coincap.io/
  // example: https://api.coincap.io/v2/assets/bitcoin

  async fetch({ assetId, schema }) {
    return this._requestJson({
      schema,
      url: `https://api.coincap.io/v2/assets/${assetId}`,
      errorMessages: {
        404: 'asset not found',
      },
    })
  }
}

export { BaseCoincapService }
