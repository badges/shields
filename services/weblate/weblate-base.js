import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { optionalUrl } from '../validators.js'

export default class WeblateBase extends BaseJsonService {
  static queryParamSchema = Joi.object({
    server: optionalUrl,
  }).required()

  static auth = {
    passKey: 'weblate_api_key',
    isRequired: false,
    serviceKey: 'weblate',
  }

  async fetch(requestParams) {
    return this._requestJson(
      this.authHelper.withBearerAuthHeader(
        requestParams,
        'Token' // lgtm [js/hardcoded-credentials]
      )
    )
  }
}
