'use strict'

const { renderBuildStatusBadge } = require('../build-status')
const { BaseSvgScrapingService } = require('..')

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

module.exports = class Netlify extends BaseSvgScrapingService {
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
    if (buffer.includes('#EAFAF9')) return { message: 'passing' }
    if (buffer.includes('#FFF3F4')) return { message: 'failing' }
    if (buffer.includes('#FEFAEA')) return { message: 'building' }
    return { message: 'unknown' }
  }

  async handle({ projectId, branch }) {
    const { message: status } = await this.fetch({ projectId, branch })
    return this.constructor.render({ status })
  }
}
