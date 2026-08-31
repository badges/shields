import { renderVersionBadge } from '../version.js'
import { BaseService, InvalidResponse, pathParams } from '../index.js'

export default class SdkmanVersion extends BaseService {
  static category = 'version'

  static route = {
    base: 'sdkman/v',
    pattern: ':candidate',
  }

  static openApi = {
    '/sdkman/v/{candidate}': {
      get: {
        summary: 'SDKMAN Version',
        parameters: pathParams({
          name: 'candidate',
          example: 'java',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'sdkman' }

  async fetch({ candidate }) {
    return this._request({
      url: `https://api.sdkman.io/2/candidates/default/${candidate}`,
      httpErrors: { 400: 'not found' },
    })
  }

  async handle({ candidate }) {
    const { buffer } = await this.fetch({ candidate })
    const version = buffer.trim()
    if (!version) {
      throw new InvalidResponse({ prettyMessage: 'invalid response data' })
    }
    return renderVersionBadge({ version })
  }
}
