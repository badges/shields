'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class Buildkite extends LegacyService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'buildkite',
    }
  }

  static get examples() {
    return [
      {
        title: 'Buildkite',
        previewUrl: '3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489/master',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/buildkite\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const identifier = match[1] // eg, 3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489
        const branch = match[2] || 'master' // Defaults to master if not specified
        const format = match[3]

        const url = `https://badge.buildkite.com/${identifier}.json?branch=${branch}`
        const badgeData = getBadgeData('build', data)

        request(url, (err, res, buffer) => {
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }

          try {
            const data = JSON.parse(buffer)
            const status = data.status
            if (status === 'passing') {
              badgeData.text[1] = 'passing'
              badgeData.colorscheme = 'green'
            } else if (status === 'failing') {
              badgeData.text[1] = 'failing'
              badgeData.colorscheme = 'red'
            } else {
              badgeData.text[1] = 'unknown'
              badgeData.colorscheme = 'lightgray'
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
