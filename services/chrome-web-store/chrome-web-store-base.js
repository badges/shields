'use strict'

const ChromeWebStore = require('webextension-store-meta/lib/chrome-web-store')
const checkErrorResponse = require('../../core/base-service/check-error-response')
const { BaseService, Inaccessible } = require('..')

module.exports = class BaseChromeWebStoreService extends BaseService {
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
