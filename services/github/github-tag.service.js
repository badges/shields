'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
} = require('../../lib/badge-data')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')
const { latest: latestVersion } = require('../../lib/version')
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
module.exports = class GithubTag extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'github',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub tag (latest SemVer)',
        previewUrl: 'tag/expressjs/express',
        documentation,
      },
      {
        title: 'GitHub tag (latest SemVer pre-release)',
        previewUrl: 'tag-pre/expressjs/express',
        documentation,
      },
      {
        title: 'GitHub tag (latest by date)',
        previewUrl: 'tag-date/expressjs/express',
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/(tag-pre|tag-date|tag)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const includePre = match[1].includes('pre')
        const sortOrder = match[1] === 'tag-date' ? 'date' : 'semver'
        const user = match[2] // eg, expressjs/express
        const repo = match[3]
        const format = match[4]
        const apiUrl = `/repos/${user}/${repo}/tags`
        const badgeData = getBadgeData('tag', data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
        }
        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (githubCheckErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            const versions = data.map(e => e.name)
            const tag =
              sortOrder === 'date'
                ? versions[0]
                : latestVersion(versions, { pre: includePre })
            badgeData.text[1] = versionText(tag)
            badgeData.colorscheme =
              sortOrder === 'date' ? 'blue' : versionColor(tag)
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
