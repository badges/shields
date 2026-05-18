import { EdgeAddons } from 'webextension-store-meta/lib/edge-addons/index.js'
import { BaseService } from '../index.js'

const description = `
[Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/) publishes extensions for Microsoft Edge.
`

export { description }

export default class BaseEdgeAddOnsService extends BaseService {
  async fetch({ storeId }) {
    return EdgeAddons.load({ id: storeId, qs: { hl: 'en-US' } })
  }
}
