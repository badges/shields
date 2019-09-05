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
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'netlify',
      pattern: ':projectId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Netlify',
        namedParams: {
          projectId: 'e6d5a4e0-dee1-4261-833e-2f47f509c68f',
        },
        staticPreview: renderBuildStatusBadge({ status: 'passing' }),
      },
      // {
      //   title: 'Netlify (branch)',
      //   pattern: ':projectId/:branch',
      //   namedParams: {
      //     projectId: '0bdb0440-3af5-0133-00ea-0ebda3a33bf6',
      //     branch: 'master',
      //   },
      //   staticPreview: renderBuildStatusBadge({ status: 'passing' }),
      // },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'netlify',
      namedLogo: 'netlify',
    }
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
    return { message: 'project not found' }
  }

  async handle({ projectId, branch }) {
    const { message: status } = await this.fetch({ projectId, branch })
    return this.constructor.render({ status })
  }
}
