import { renderBuildStatusBadge } from '../build-status.js'
import { BaseSvgScrapingService, pathParams } from '../index.js'

const pendingStatus = 'building'
const notBuiltStatus = 'not built'

const statusMap = {
  building: pendingStatus,
  waiting: pendingStatus,
  initiated: pendingStatus,
  stopped: notBuiltStatus,
  ignored: notBuiltStatus,
  blocked: notBuiltStatus,
  infrastructure_failure: 'failed',
}

export default class Netlify extends BaseSvgScrapingService {
  static category = 'build'

  static route = {
    base: 'netlify',
    pattern: ':projectId',
  }

  static openApi = {
    '/netlify/{projectId}': {
      get: {
        summary: 'Netlify',
        description:
          'To locate your project id, visit your project settings, scroll to "Status badges" under "General", and copy the ID between "/api/v1/badges/" and "/deploy-status" in the code sample',
        parameters: pathParams({
          name: 'projectId',
          example: 'e6d5a4e0-dee1-4261-833e-2f47f509c68f',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'netlify',
  }

  static render({ status }) {
    status = statusMap[status] || status
    const result = renderBuildStatusBadge({ status })
    if (result.message === 'building' && !result.color) {
      result.color = 'yellow'
    }
    return result
  }

  async fetch({ projectId }) {
    const url = `https://api.netlify.com/api/v1/badges/${projectId}/deploy-status`
    const { buffer } = await this._request({
      url,
    })
    if (buffer.includes('#0F4A21')) return { message: 'passing' }
    if (buffer.includes('#800A20')) return { message: 'failing' }
    if (buffer.includes('#603408')) return { message: 'building' }
    if (buffer.includes('#181A1C')) return { message: 'canceled' }
    return { message: 'unknown' }
  }

  async handle({ projectId }) {
    const { message: status } = await this.fetch({ projectId })
    return this.constructor.render({ status })
  }
}
