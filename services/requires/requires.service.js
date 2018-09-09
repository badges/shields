'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')

module.exports = class RequiresIo extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/requires\/([^/]+\/[^/]+\/[^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const userRepo = match[1] // eg, `github/celery/celery`.
        const branch = match[2]
        const format = match[3]
        let uri = 'https://requires.io/api/v1/status/' + userRepo
        if (branch != null) {
          uri += '?branch=' + branch
        }
        const options = {
          method: 'GET',
          uri: uri,
        }
        const badgeData = getBadgeData('requirements', data)
        request(options, (err, res, buffer) => {
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const json = JSON.parse(buffer)
            if (json.status === 'up-to-date') {
              badgeData.text[1] = 'up to date'
              badgeData.colorscheme = 'brightgreen'
            } else if (json.status === 'outdated') {
              badgeData.text[1] = 'outdated'
              badgeData.colorscheme = 'yellow'
            } else if (json.status === 'insecure') {
              badgeData.text[1] = 'insecure'
              badgeData.colorscheme = 'red'
            } else {
              badgeData.text[1] = 'unknown'
              badgeData.colorscheme = 'lightgrey'
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
