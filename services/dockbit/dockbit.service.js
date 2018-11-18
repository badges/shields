'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

module.exports = class Dockbit extends LegacyService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'dockbit',
    }
  }

  static get examples() {
    return [
      {
        title: 'Dockbit',
        previewUrl: 'DockbitStatus/health?token=TvavttxFHJ4qhnKstDxrvBXM',
        pattern: ':organisation/:pipeline?token=:token',
        exampleUrl: 'DockbitStatus/health?token=TvavttxFHJ4qhnKstDxrvBXM',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/dockbit\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+)\.(svg|png|gif|jpg|json)$/,
      cache({
        queryParams: ['token'],
        handler: (data, match, sendBadge, request) => {
          const org = match[1]
          const pipeline = match[2]
          const format = match[3]

          const token = data.token
          const badgeData = getBadgeData('deploy', data)
          const apiUrl = `https://dockbit.com/${org}/${pipeline}/status/${token}`

          const dockbitStates = {
            success: '#72BC37',
            failure: '#F55C51',
            error: '#F55C51',
            working: '#FCBC41',
            pending: '#CFD0D7',
            rejected: '#CFD0D7',
          }

          request(apiUrl, { json: true }, (err, res, data) => {
            try {
              if (res && (res.statusCode === 404 || data.state === null)) {
                badgeData.text[1] = 'not found'
                sendBadge(format, badgeData)
                return
              }

              if (!res || err !== null || res.statusCode !== 200) {
                badgeData.text[1] = 'inaccessible'
                sendBadge(format, badgeData)
                return
              }

              badgeData.text[1] = data.state
              badgeData.colorB = dockbitStates[data.state]

              sendBadge(format, badgeData)
            } catch (e) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            }
          })
        },
      })
    )
  }
}
