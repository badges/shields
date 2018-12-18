'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const log = require('../../lib/log')

// For NetflixOSS metadata: https://github.com/Netflix/osstracker
//
// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class OssTracker extends LegacyService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'osslifecycle',
    }
  }

  static get examples() {
    return [
      {
        title: 'NetflixOSS Lifecycle',
        previewUrl: 'Netflix/osstracker',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/osslifecycle?\/([^/]+\/[^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const orgOrUserAndRepo = match[1]
        const branch = match[2]
        const format = match[3]
        let url = `https://raw.githubusercontent.com/${orgOrUserAndRepo}`
        if (branch != null) {
          url += `/${branch}/OSSMETADATA`
        } else {
          url += '/master/OSSMETADATA'
        }
        const options = {
          method: 'GET',
          uri: url,
        }
        const badgeData = getBadgeData('oss lifecycle', data)
        request(options, (err, res, body) => {
          if (err != null) {
            log.error(`NetflixOSS error: ${err.stack}`)
            if (res) {
              log.error(`${res}`)
            }
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
            return
          }
          try {
            const matchStatus = body.match(/osslifecycle=([a-z]+)/im)
            if (matchStatus === null) {
              badgeData.text[1] = 'inaccessible'
              sendBadge(format, badgeData)
              return
            } else {
              badgeData.text[1] = matchStatus[1]
              sendBadge(format, badgeData)
              return
            }
          } catch (e) {
            log(e)
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
