'use strict'

const prettyBytes = require('pretty-bytes')
const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
} = require('../../lib/badge-data')
const {
  documentation,
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

module.exports = class GithubSize extends LegacyService {
  static get category() {
    return 'size'
  }

  static get route() {
    return {
      base: 'github/size',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub repo size in bytes',
        previewUrl: 'webcaetano/craft/build/phaser-craft.min.js',
        keywords: ['GitHub', 'file', 'size'],
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/size\/([^/]+)\/([^/]+)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const user = match[1] // eg, mashape
        const repo = match[2] // eg, apistatus
        const path = match[3]
        const format = match[4]
        const apiUrl = `/repos/${user}/${repo}/contents/${path}`

        const badgeData = getBadgeData('size', data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
        }

        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (
            githubCheckErrorResponse(
              badgeData,
              err,
              res,
              'repo or file not found'
            )
          ) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const body = JSON.parse(buffer)
            if (body && Number.isInteger(body.size)) {
              badgeData.text[1] = prettyBytes(body.size)
              badgeData.colorscheme = 'green'
              sendBadge(format, badgeData)
            } else {
              badgeData.text[1] = 'not a regular file'
              sendBadge(format, badgeData)
            }
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
