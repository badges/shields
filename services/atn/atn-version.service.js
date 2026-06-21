import { renderVersionBadge } from '../version.js'
import { pathParams } from '../index.js'
import { BaseAtnService, description } from './atn-base.js'

export default class AtnVersion extends BaseAtnService {
  static category = 'version'
  static route = { base: 'atn/v', pattern: ':addonId' }

  static openApi = {
    '/atn/v/{addonId}': {
      get: {
        summary: 'Thunderbird Add-on Version',
        description,
        parameters: pathParams({
          name: 'addonId',
          example: 'unicodify-text-transformer',
        }),
      },
    },
  }

  async handle({ addonId }) {
    const data = await this.fetch({ addonId })
    return renderVersionBadge({ version: data.current_version.version })
  }
}
