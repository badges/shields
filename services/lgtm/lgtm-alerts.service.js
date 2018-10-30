'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')
const { metric } = require('../../lib/text-formatters')

module.exports = class LgtmAlerts extends LegacyService {
  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'lgtm/alerts',
    }
  }

  static get examples() {
    return [
      {
        title: 'LGTM Alerts',
        previewUrl: 'g/apache/cloudstack',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/lgtm\/alerts\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const projectId = match[1] // eg, `g/apache/cloudstack`
        const format = match[2]
        const url =
          'https://lgtm.com/api/v0.1/project/' + projectId + '/details'
        const badgeData = getBadgeData('lgtm', data)
        request(url, (err, res, buffer) => {
          if (
            checkErrorResponse(badgeData, err, res, {
              404: 'project not found',
            })
          ) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            if (!('alerts' in data)) throw new Error('Invalid data')
            badgeData.text[1] =
              metric(data.alerts) + (data.alerts === 1 ? ' alert' : ' alerts')

            if (data.alerts === 0) {
              badgeData.colorscheme = 'brightgreen'
            } else {
              badgeData.colorscheme = 'yellow'
            }
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
