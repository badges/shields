'use strict'

const { BaseService } = require('..')
const chromeWebStore = require('chrome-web-store-item-property')
const { checkErrorResponse } = require('../../lib/error-helper')

module.exports = class BaseChromeWebStoreService extends BaseService {
  async fetch({ storeId }) {
    try {
      return await chromeWebStore(storeId)
    } catch (e) {
      return checkErrorResponse.asPromise({})({ buffer: '', res: e })
    }
  }
}
