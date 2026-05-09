import { renderVersionBadge } from '../version.js'
import { pathParam, queryParam } from '../index.js'
import { BaseAmoService, description, queryParamSchema } from './amo-base.js'

export default class AmoVersion extends BaseAmoService {
  static category = 'version'
  static route = { base: 'amo/v', pattern: ':addonId', queryParamSchema }

  static openApi = {
    '/amo/v/{addonId}': {
      get: {
        summary: 'Mozilla Add-on Version',
        description,
        parameters: [
          pathParam({ name: 'addonId', example: 'dustman' }),
          queryParam({
            name: 'registry',
            example: 'thunderbird',
            schema: { type: 'string', enum: ['firefox', 'thunderbird'] },
            description:
              'Registry to use. Can be `firefox` (default) or `thunderbird`.',
          }),
        ],
      },
    },
  }

  async handle({ addonId }, { registry }) {
    const data = await this.fetch({ addonId, registry })
    return renderVersionBadge({ version: data.current_version.version })
  }
}
