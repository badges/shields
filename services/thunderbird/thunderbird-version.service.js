import { renderVersionBadge } from '../version.js'
import { pathParams } from '../index.js'
import { BaseThunderbirdService, description } from './thunderbird-base.js'

export default class ThunderbirdVersion extends BaseThunderbirdService {
  static category = 'version'
  static route = { base: 'thunderbird/v', pattern: ':addonId' }

  static openApi = {
    '/thunderbird/v/{addonId}': {
      get: {
        summary: 'Thunderbird Add-on Version',
        description,
        parameters: pathParams({ name: 'addonId', example: 'cardbook' }),
      },
    },
  }

  async handle({ addonId }) {
    const data = await this.fetch({ addonId })
    return renderVersionBadge({ version: data.current_version.version })
  }
}
