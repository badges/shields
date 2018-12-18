'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { regularUpdate } = require('../../lib/regular-update')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class JenkinsPlugin extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'jenkins/plugin/v',
    }
  }

  static get examples() {
    return [
      {
        title: 'Jenkins Plugins',
        previewUrl: 'blueocean',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/jenkins\/plugin\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const pluginId = match[1] // e.g. blueocean
        const format = match[2]
        const badgeData = getBadgeData('plugin', data)
        regularUpdate(
          {
            url:
              'https://updates.jenkins-ci.org/current/update-center.actual.json',
            intervalMillis: 4 * 3600 * 1000,
            scraper: json =>
              Object.keys(json.plugins).reduce((previous, current) => {
                previous[current] = json.plugins[current].version
                return previous
              }, {}),
          },
          (err, versions) => {
            if (err != null) {
              badgeData.text[1] = 'inaccessible'
              sendBadge(format, badgeData)
              return
            }
            try {
              const version = versions[pluginId]
              if (version === undefined) {
                throw Error('Plugin not found!')
              }
              badgeData.text[1] = versionText(version)
              badgeData.colorscheme = versionColor(version)
              sendBadge(format, badgeData)
            } catch (e) {
              badgeData.text[1] = 'not found'
              sendBadge(format, badgeData)
            }
          }
        )
      })
    )
  }
}
