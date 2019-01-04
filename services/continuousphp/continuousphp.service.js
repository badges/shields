'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class ContinuousPhp extends LegacyService {
  static get category() {
    return 'build'
  }

  static get route() {
    return { base: 'continuousphp' }
  }

  static get examples() {
    return [
      {
        title: 'continuousphp',
        previewUrl: 'git-hub/doctrine/dbal/master',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/continuousphp\/([^/]+)\/([^/]+\/[^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const provider = match[1]
        const userRepo = match[2]
        const branch = match[3]
        const format = match[4]

        const options = {
          method: 'GET',
          uri: `https://status.continuousphp.com/${provider}/${userRepo}/status-info`,
          headers: {
            Accept: 'application/json',
          },
        }

        if (branch != null) {
          options.uri += `?branch=${branch}`
        }

        const badgeData = getBadgeData('build', data)
        request(options, (err, res) => {
          if (err != null) {
            console.error(`continuousphp error: ${err.stack}`)
            if (res) {
              console.error(`${res}`)
            }

            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
            return
          }

          try {
            const status = JSON.parse(res['body']).status

            badgeData.text[1] = status

            if (status === 'passing') {
              badgeData.colorscheme = 'brightgreen'
            } else if (status === 'failing') {
              badgeData.colorscheme = 'red'
            } else if (status === 'unstable') {
              badgeData.colorscheme = 'yellow'
            } else if (status === 'running') {
              badgeData.colorscheme = 'blue'
            } else if (status === 'unknown') {
              badgeData.colorscheme = 'lightgrey'
            } else {
              badgeData.text[1] = status
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
