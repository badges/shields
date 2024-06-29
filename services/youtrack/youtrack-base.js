import { BaseJsonService } from '../index.js'

export default class YoutrackBase extends BaseJsonService {
  static auth = {
    passKey: 'youtrack_token',
    serviceKey: 'youtrack',
  }

  async fetch({ url, options, schema, httpErrors }) {
    return this._requestJson(
      this.authHelper.withBearerAuthHeader({
        schema,
        url,
        options,
        httpErrors: { 500: 'invalid query', ...httpErrors },
        systemErrors: {
          ETIMEOUT: { prettyMessage: 'timeout', cacheSeconds: 10 },
        },
      }),
    )
  }
}
