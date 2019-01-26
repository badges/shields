'use strict'

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
module.exports = class Jitpack extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'jitpack/v',
      pattern: ':groupId/:artifactId',
    }
  }

  static get examples() {
    return [
      {
        title: 'JitPack',
        namedParams: {
          groupId: 'jitpack',
          artifactId: 'maven-simple',
        },
        staticPreview: {
          label: 'jitpack',
          message: 'v1.1',
          color: 'blue',
        },
        keywords: ['java', 'maven'],
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/jitpack\/v\/([^/]*)\/([^/]*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const groupId = `com.github.${match[1]}` // github user
        const artifactId = match[2] // the project's name
        const format = match[3] // "svg"

        const pkg = `${groupId}/${artifactId}/latest`
        const apiUrl = `https://jitpack.io/api/builds/${pkg}`

        const badgeData = getBadgeData('jitpack', data)

        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          if (res.statusCode === 404) {
            badgeData.text[1] = 'not found'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            const status = data['status']
            let color = versionColor(data['version'])
            let version = versionText(data['version'])
            if (status !== 'ok') {
              color = 'red'
              version = 'unknown'
            }
            badgeData.text[1] = version
            badgeData.colorscheme = color
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
