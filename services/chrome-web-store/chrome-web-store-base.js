import { ChromeWebStore } from 'webextension-store-meta/lib/chrome-web-store/index.js'
import checkErrorResponse from '../../core/base-service/check-error-response.js'
import { BaseService, Inaccessible } from '../index.js'

const description = `
Our servers make requests to the Chrome Web Store from the US East region. Therefore, the extension must not be regionally restricted by the publisher for that location.
`

export { description }

export default class BaseChromeWebStoreService extends BaseService {
  async fetch({ storeId }) {
    try {
      return await ChromeWebStore.load({ id: storeId })
    } catch (e) {
      const statusCode = parseInt(e.message)
      if (isNaN(statusCode)) {
        throw new Inaccessible({ underlyingError: e })
      }
      e.statusCode = statusCode
      return checkErrorResponse({})({ buffer: '', res: e })
    }
  }
}
