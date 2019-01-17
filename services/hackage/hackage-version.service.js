'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class HackageVersion extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'hackage/v',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Hackage',
        namedParams: { packageName: 'lens' },
        staticPreview: {
          label: 'hackage',
          message: 'v4.1.7',
          color: 'blue',
        },
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/hackage\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const repo = match[1] // eg, `lens`.
        const format = match[2]
        const apiUrl = `https://hackage.haskell.org/package/${repo}/${repo}.cabal`
        const badgeData = getBadgeData('hackage', data)
        request(apiUrl, (err, res, buffer) => {
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }

          try {
            const lines = buffer.split('\n')
            const versionLines = lines.filter(
              e => /^version:/i.test(e) === true
            )
            // We don't have to check length of versionLines, because if we throw,
            // we'll render the 'invalid' badge below, which is the correct thing
            // to do.
            const version = versionLines[0].split(/:/)[1].trim()
            badgeData.text[1] = versionText(version)
            badgeData.colorscheme = versionColor(version)
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
