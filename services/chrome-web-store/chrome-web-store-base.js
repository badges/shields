import ChromeWebStore from 'webextension-store-meta/lib/chrome-web-store';
import checkErrorResponse from '../../core/base-service/check-error-response.js';
import {BaseService, Inaccessible} from '..';

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
};
