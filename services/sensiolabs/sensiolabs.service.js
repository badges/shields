'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const serverSecrets = require('../../lib/server-secrets')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class Sensiolabs extends LegacyService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'sensiolabs',
    }
  }

  static get examples() {
    return [
      {
        title: 'SensioLabs Insight',
        previewUrl: 'i/45afb680-d4e6-4e66-93ea-bcfa79eb8a87',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/sensiolabs\/i\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const projectUuid = match[1]
        const format = match[2]
        const options = {
          method: 'GET',
          uri: `https://insight.sensiolabs.com/api/projects/${projectUuid}`,
          headers: {
            Accept: 'application/vnd.com.sensiolabs.insight+xml',
          },
        }

        if (serverSecrets && serverSecrets.sl_insight_userUuid) {
          options.auth = {
            user: serverSecrets.sl_insight_userUuid,
            pass: serverSecrets.sl_insight_apiToken,
          }
        }

        const badgeData = getBadgeData('check', data)

        request(options, (err, res, body) => {
          if (err != null || res.statusCode !== 200) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }

          const matchStatus = body.match(
            /<status><!\[CDATA\[([a-z]+)\]\]><\/status>/im
          )
          const matchGrade = body.match(
            /<grade><!\[CDATA\[([a-z]+)\]\]><\/grade>/im
          )

          if (matchStatus === null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          } else if (matchStatus[1] !== 'finished') {
            badgeData.text[1] = 'pending'
            sendBadge(format, badgeData)
            return
          } else if (matchGrade === null) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
            return
          }

          if (matchGrade[1] === 'platinum') {
            badgeData.text[1] = 'platinum'
            badgeData.colorscheme = 'brightgreen'
          } else if (matchGrade[1] === 'gold') {
            badgeData.text[1] = 'gold'
            badgeData.colorscheme = 'yellow'
          } else if (matchGrade[1] === 'silver') {
            badgeData.text[1] = 'silver'
            badgeData.colorscheme = 'lightgrey'
          } else if (matchGrade[1] === 'bronze') {
            badgeData.text[1] = 'bronze'
            badgeData.colorscheme = 'orange'
          } else if (matchGrade[1] === 'none') {
            badgeData.text[1] = 'no medal'
            badgeData.colorscheme = 'red'
          } else {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
            return
          }

          sendBadge(format, badgeData)
        })
      })
    )
  }
}
