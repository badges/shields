'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')

module.exports = class HackageDeps extends LegacyService {
  static get category() {
    return 'dependencies'
  }

  static get route() {
    return {
      base: 'hackage-deps/v',
    }
  }

  static get examples() {
    return [
      {
        title: 'Hackage-Deps',
        previewUrl: 'lens',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/hackage-deps\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const repo = match[1] // eg, `lens`.
        const format = match[2]
        const reverseUrl = `http://packdeps.haskellers.com/licenses/${repo}`
        const feedUrl = `http://packdeps.haskellers.com/feed/${repo}`
        const badgeData = getBadgeData('dependencies', data)

        // first call /reverse to check if the package exists
        // this will throw a 404 if it doesn't
        request(reverseUrl, (err, res, buffer) => {
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }

          // if the package exists, then query /feed to check the dependencies
          request(feedUrl, (err, res, buffer) => {
            if (err != null) {
              badgeData.text[1] = 'inaccessible'
              sendBadge(format, badgeData)
              return
            }

            try {
              const outdatedStr = `Outdated dependencies for ${repo} `
              if (buffer.indexOf(outdatedStr) >= 0) {
                badgeData.text[1] = 'outdated'
                badgeData.colorscheme = 'orange'
              } else {
                badgeData.text[1] = 'up to date'
                badgeData.colorscheme = 'brightgreen'
              }
            } catch (e) {
              badgeData.text[1] = 'invalid'
            }
            sendBadge(format, badgeData)
          })
        })
      })
    )
  }
}
