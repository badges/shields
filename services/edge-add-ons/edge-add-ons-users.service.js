import { renderDownloadsBadge } from '../downloads.js'
import { redirector, NotFound, pathParams } from '../index.js'
import BaseEdgeAddOnsService, { description } from './edge-add-ons-base.js'

class EdgeAddOnsUsers extends BaseEdgeAddOnsService {
  static category = 'downloads'
  static route = { base: 'edge-add-ons/users', pattern: ':storeId' }

  static openApi = {
    '/edge-add-ons/users/{storeId}': {
      get: {
        summary: 'Microsoft Edge Add-ons Users',
        description,
        parameters: pathParams({
          name: 'storeId',
          example: 'cnlefmmeadmemmdciolhbnfeacpdfbkd',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'users' }

  async handle({ storeId }) {
    const edgeAddOns = await this.fetch({ storeId })
    const downloads = edgeAddOns.activeInstallCount()
    if (downloads == null) {
      throw new NotFound({ prettyMessage: 'not found' })
    }
    return renderDownloadsBadge({
      downloads,
    })
  }
}

const EdgeAddOnsDownloads = redirector({
  category: 'downloads',
  route: {
    base: 'edge-add-ons/d',
    pattern: ':storeId',
  },
  transformPath: ({ storeId }) => `/edge-add-ons/users/${storeId}`,
  dateAdded: new Date('2026-05-18'),
})

export { EdgeAddOnsDownloads, EdgeAddOnsUsers }
