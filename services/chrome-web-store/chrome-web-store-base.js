'use strict'

const chromeWebStore = require('chrome-web-store-item-property')
const checkErrorResponse = require('../../core/base-service/check-error-response')
const { BaseService, Inaccessible } = require('..')

module.exports = class BaseChromeWebStoreService extends BaseService {
  async fetch({ storeId }) {
    try {
      return await chromeWebStore(storeId)
    } catch (e) {
      if (e.statusCode === undefined) {
        throw new Inaccessible({ underlyingError: e })
      }
      /*
      chrome-web-store-item-property's `HTTPError` object has a
      `statusCode` property so we can pass `e` to `checkErrorResponse`
      to throw the correct `ShieldsRuntimeError` for us.
      */
      return checkErrorResponse({})({ buffer: '', res: e })
    }
  }
}
