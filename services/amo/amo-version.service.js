import { renderVersionBadge } from '../version.js'
import { pathParams } from '../index.js'
import { BaseAmoService, description } from './amo-base.js'

export default class AmoVersion extends BaseAmoService {
  static category = 'version'
  static route = { base: 'amo/v', pattern: ':addonId' }

  static openApi = {
    '/amo/v/{addonId}': {
      get: {
        summary: 'Mozilla Add-on Version',
        description,
        parameters: pathParams({ name: 'addonId', example: 'dustman' }),
      },
    },
  }

  async handle({ addonId }) {
    const data = await this.fetch({ addonId })
    return renderVersionBadge({ version: data.current_version.version })
  }
}
