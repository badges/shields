'use strict'

const moment = require('moment')
const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { makeLogo: getLogo } = require('../../lib/logos')
const { formatDate } = require('../../lib/text-formatters')
const { age } = require('../../lib/color-formatters')
const { documentation } = require('./github-helpers')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class GithubReleaseDate extends LegacyService {
  static get category() {
    return 'activity'
  }

  static get route() {
    return {
      base: 'github',
      pattern: ':which(release-date|release-date-pre)/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub Release Date',
        pattern: 'release-date/:user/:repo',
        namedParams: {
          user: 'SubtitleEdit',
          repo: 'subtitleedit',
        },
        staticPreview: {
          label: 'release date',
          message: 'december 2018',
          color: 'green',
        },
        documentation,
      },
      {
        title: 'GitHub (Pre-)Release Date',
        pattern: 'release-date-pre/:user/:repo',
        namedParams: {
          user: 'Cockatrice',
          repo: 'Cockatrice',
        },
        staticPreview: {
          label: 'release date',
          message: 'december 2018',
          color: 'green',
        },
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/(release-date|release-date-pre)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const releaseType = match[1] // eg, release-date-pre / release-date
        const user = match[2] // eg, microsoft
        const repo = match[3] // eg, vscode
        const format = match[4]
        let apiUrl = `/repos/${user}/${repo}/releases`
        if (releaseType === 'release-date') {
          apiUrl += '/latest'
        }
        const badgeData = getBadgeData('release date', data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
        }
        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }

          //github return 404 if repo not found or no release
          if (res.statusCode === 404) {
            badgeData.text[1] = 'no releases or repo not found'
            sendBadge(format, badgeData)
            return
          }

          try {
            let data = JSON.parse(buffer)
            if (releaseType === 'release-date-pre') {
              data = data[0]
            }
            const releaseDate = moment(data.created_at)
            badgeData.text[1] = formatDate(releaseDate)
            badgeData.colorscheme = age(releaseDate)
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
