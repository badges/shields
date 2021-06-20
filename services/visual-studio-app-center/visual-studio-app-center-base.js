import { BaseJsonService } from '../index.js'

const keywords = [
  'visual-studio',
  'vsac',
  'visual-studio-app-center',
  'app-center',
]

const documentation =
  "You will need to create a <b>read-only</b> API token <a target='_blank' href='https://appcenter.ms/settings/apitokens'>here</a>."

class BaseVisualStudioAppCenterService extends BaseJsonService {
  async fetch({
    owner,
    app,
    token,
    schema,
    url = `https://api.appcenter.ms/v0.1/apps/${owner}/${app}/releases/latest`,
  }) {
    return this._requestJson({
      schema,
      options: {
        headers: {
          'X-API-Token': token,
        },
      },
      errorMessages: {
        401: 'invalid token',
        403: 'project not found',
        404: 'project not found',
      },
      url,
    })
  }
}

export { keywords, documentation, BaseVisualStudioAppCenterService }
