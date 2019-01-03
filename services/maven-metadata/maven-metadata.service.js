'use strict'

const xml2js = require('xml2js')
const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class MavenMetadata extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'maven-metadata/v',
    }
  }

  static get examples() {
    return [
      {
        title: 'Maven metadata URL',
        previewUrl:
          'http/central.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/maven-metadata\/v\/(https?)\/(.+\.xml)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const [, scheme, hostAndPath, format] = match
        const metadataUri = `${scheme}://${hostAndPath}`
        request(metadataUri, (error, response, body) => {
          const badge = getBadgeData('maven', data)
          if (
            !error &&
            response.statusCode >= 200 &&
            response.statusCode < 300
          ) {
            try {
              xml2js.parseString(body, (err, result) => {
                if (err) {
                  badge.text[1] = 'error'
                  badge.colorscheme = 'red'
                  sendBadge(format, badge)
                } else {
                  const version = result.metadata.versioning[0].versions[0].version.slice(
                    -1
                  )[0]
                  badge.text[1] = versionText(version)
                  badge.colorscheme = versionColor(version)
                  sendBadge(format, badge)
                }
              })
            } catch (e) {
              badge.text[1] = 'error'
              badge.colorscheme = 'red'
              sendBadge(format, badge)
            }
          } else {
            badge.text[1] = 'error'
            badge.colorscheme = 'red'
            sendBadge(format, badge)
          }
        })
      })
    )
  }
}
