import { renderDateBadge } from '../date.js'
import { NotFound, pathParams } from '../index.js'
import BaseEdgeAddOnsService, { description } from './edge-add-ons-base.js'

export default class EdgeAddOnsLastUpdated extends BaseEdgeAddOnsService {
  static category = 'activity'
  static route = { base: 'edge-add-ons/last-updated', pattern: ':storeId' }

  static openApi = {
    '/edge-add-ons/last-updated/{storeId}': {
      get: {
        summary: 'Microsoft Edge Add-ons Last Updated',
        description,
        parameters: pathParams({
          name: 'storeId',
          example: 'cnlefmmeadmemmdciolhbnfeacpdfbkd',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'last updated',
  }

  async handle({ storeId }) {
    const edgeAddOns = await this.fetch({ storeId })
    const lastUpdated = edgeAddOns.lastUpdateDate()

    if (lastUpdated == null) {
      throw new NotFound({ prettyMessage: 'not found' })
    }

    return renderDateBadge(lastUpdated * 1000)
  }
}
