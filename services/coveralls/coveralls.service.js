'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const {
  coveragePercentage: coveragePercentageColor,
} = require('../../lib/color-formatters')

module.exports = class Coveralls extends LegacyService {
  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'coveralls',
    }
  }

  static get examples() {
    return [
      {
        title: 'Coveralls github',
        previewUrl: 'github/jekyll/jekyll',
      },
      {
        title: 'Coveralls github branch',
        previewUrl: 'github/jekyll/jekyll/master',
      },
      {
        title: 'Coveralls bitbucket',
        previewUrl: 'bitbucket/pyKLIP/pyklip',
      },
      {
        title: 'Coveralls bitbucket branch',
        previewUrl: 'bitbucket/pyKLIP/pyklip/master',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/coveralls\/(?:(bitbucket|github)\/)?([^/]+\/[^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const repoService = match[1] ? match[1] : 'github'
        const userRepo = match[2] // eg, `jekyll/jekyll`.
        const branch = match[3]
        const format = match[4]
        const apiUrl = {
          url: `https://coveralls.io/repos/${repoService}/${userRepo}/badge.svg`,
          followRedirect: false,
          method: 'HEAD',
        }
        if (branch) {
          apiUrl.url += `?branch=${branch}`
        }
        const badgeData = getBadgeData('coverage', data)
        request(apiUrl, (err, res) => {
          if (err != null) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
            return
          }
          // We should get a 302. Look inside the Location header.
          const buffer = res.headers.location
          if (!buffer) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
            return
          }
          try {
            const score = buffer.split('_')[1].split('.')[0]
            const percentage = parseInt(score)
            if (Number.isNaN(percentage)) {
              badgeData.text[1] = 'unknown'
              sendBadge(format, badgeData)
              return
            }
            badgeData.text[1] = `${score}%`
            badgeData.colorscheme = coveragePercentageColor(percentage)
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'malformed'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
