import { renderBuildStatusBadge } from '../build-status.js'
import { BaseSvgScrapingService } from '../index.js'

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

  static examples = [
    {
      title: 'Netlify',
      namedParams: {
        projectId: 'e6d5a4e0-dee1-4261-833e-2f47f509c68f',
      },
      documentation:
        'To locate your project id, visit your project settings, scroll to "Status badges" under "General", and copy the ID between "/api/v1/badges/" and "/deploy-status" in the code sample',
      staticPreview: renderBuildStatusBadge({ status: 'passing' }),
    },
  ]

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

  async fetch({ projectId, branch }) {
    const url = `https://api.netlify.com/api/v1/badges/${projectId}/deploy-status`
    const { buffer } = await this._request({
      url,
    })
    if (buffer.includes('#0D544F')) return { message: 'passing' }
    if (buffer.includes('#900B31')) return { message: 'failing' }
    if (buffer.includes('#AB6F10')) return { message: 'building' }
    return { message: 'unknown' }
  }

  async handle({ projectId, branch }) {
    const { message: status } = await this.fetch({ projectId, branch })
    return this.constructor.render({ status })
  }
}
