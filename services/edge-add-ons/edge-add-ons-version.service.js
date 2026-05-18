import { renderVersionBadge } from '../version.js'
import { NotFound, pathParams } from '../index.js'
import BaseEdgeAddOnsService, { description } from './edge-add-ons-base.js'

export default class EdgeAddOnsVersion extends BaseEdgeAddOnsService {
  static category = 'version'
  static route = { base: 'edge-add-ons/v', pattern: ':storeId' }

  static openApi = {
    '/edge-add-ons/v/{storeId}': {
      get: {
        summary: 'Microsoft Edge Add-ons Version',
        description,
        parameters: pathParams({
          name: 'storeId',
          example: 'cnlefmmeadmemmdciolhbnfeacpdfbkd',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'edge add-ons' }

  async handle({ storeId }) {
    const edgeAddOns = await this.fetch({ storeId })
    const version = edgeAddOns.version()
    if (version == null) {
      throw new NotFound({ prettyMessage: 'not found' })
    }
    return renderVersionBadge({ version })
  }
}
