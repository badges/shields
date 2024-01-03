import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { optionalUrl } from '../validators.js'

export const defaultServer = 'https://hosted.weblate.org'
export const description =
  'Weblate is an web-based tool for translation and internationalization'

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
        'Token', // lgtm [js/hardcoded-credentials]
      ),
    )
  }
}
