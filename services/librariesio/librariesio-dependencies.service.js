'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')

module.exports = class LibrariesioDependencies extends LegacyService {
  static get category() {
    return 'dependencies'
  }

  static get url() {
    return {
      base: 'librariesio',
    }
  }

  static get examples() {
    return [
      {
        title: 'Libraries.io for releases',
        previewUrl: 'release/hex/phoenix/1.0.3',
      },
      {
        title: 'Libraries.io for GitHub',
        previewUrl: 'github/phoenixframework/phoenix',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/librariesio\/(github|release)\/([\w\-_]+\/[\w\-_]+)\/?([\w\-_.]+)?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const resource = match[1]
        const project = match[2]
        const version = match[3]
        const format = match[4]

        let uri
        switch (resource) {
          case 'github': {
            uri = 'https://libraries.io/api/github/' + project + '/dependencies'
            break
          }
          case 'release': {
            const v = version || 'latest'
            uri =
              'https://libraries.io/api/' + project + '/' + v + '/dependencies'
            break
          }
        }

        const options = { method: 'GET', json: true, uri }
        const badgeData = getBadgeData('dependencies', data)

        request(options, (err, res, json) => {
          if (
            checkErrorResponse(badgeData, err, res, { 404: 'not available' })
          ) {
            sendBadge(format, badgeData)
            return
          }

          try {
            const deprecated = json.dependencies.filter(dep => dep.deprecated)

            const outofdate = json.dependencies.filter(dep => dep.outdated)

            // Deprecated dependencies are really bad
            if (deprecated.length > 0) {
              badgeData.colorscheme = 'red'
              badgeData.text[1] = deprecated.length + ' deprecated'
              return sendBadge(format, badgeData)
            }

            // Out of date dependencies are pretty bad
            if (outofdate.length > 0) {
              badgeData.colorscheme = 'orange'
              badgeData.text[1] = outofdate.length + ' out of date'
              return sendBadge(format, badgeData)
            }

            // Up to date dependencies are good!
            badgeData.colorscheme = 'brightgreen'
            badgeData.text[1] = 'up to date'
            return sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
