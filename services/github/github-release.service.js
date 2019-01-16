'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
} = require('../../lib/badge-data')
const { addv: versionText } = require('../../lib/text-formatters')
const {
  documentation,
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class GithubRelease extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'github',
      pattern: ':which(release|release-pre)/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub release',
        pattern: 'release/:user/:repo',
        namedParams: {
          user: 'qubyte',
          repo: 'rubidium',
        },
        staticPreview: {
          label: 'release',
          message: 'v2.0.2',
          color: 'blue',
        },
        documentation,
      },
      {
        title: 'GitHub (pre-)release',
        pattern: 'release-pre/:user/:repo',
        namedParams: {
          user: 'qubyte',
          repo: 'rubidium',
        },
        staticPreview: {
          label: 'release',
          message: 'v2.0.2',
          color: 'blue',
        },
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/release(-pre)?\/([^/]+\/[^/]+)(?:\/(all))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const includePre = Boolean(match[1]) || match[3] === 'all'
        const userRepo = match[2] // eg, qubyte/rubidium
        const format = match[4]
        let apiUrl = `/repos/${userRepo}/releases`
        if (!includePre) {
          apiUrl = `${apiUrl}/latest`
        }
        const badgeData = getBadgeData('release', data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
        }
        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (githubCheckErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            let data = JSON.parse(buffer)
            if (includePre) {
              data = data[0]
            }
            const version = data.tag_name
            const prerelease = data.prerelease
            badgeData.text[1] = versionText(version)
            badgeData.colorscheme = prerelease ? 'orange' : 'blue'
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'none'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
