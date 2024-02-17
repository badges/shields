import { BaseJsonService } from '../index.js'

export class SnapstoreBase extends BaseJsonService {
  static auth = {
    passKey: 'None',
    authorizedOrigins: ['https://api.snapcraft.io'],
    isRequired: false,
  }

  async fetch(params) {
    return this._requestJson(params)
  }
}
