'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
} = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')
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
module.exports = class GithubDownloads extends LegacyService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'github',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub All Releases',
        pattern: 'downloads/:user/:repo/total',
        namedParams: {
          user: 'atom',
          repo: 'atom',
        },
        staticPreview: {
          label: 'downloads',
          message: '857k total',
          color: 'brightgreen',
        },
        documentation,
      },
      {
        title: 'GitHub Releases',
        pattern: 'downloads/:user/:repo/:tag/total',
        namedParams: {
          user: 'atom',
          repo: 'atom',
          tag: 'latest',
        },
        staticPreview: {
          label: 'downloads',
          message: '27k',
          color: 'brightgreen',
        },
        documentation,
      },
      {
        title: 'GitHub Pre-Releases',
        pattern: 'downloads-pre/:user/:repo/:tag/total',
        namedParams: {
          user: 'atom',
          repo: 'atom',
          tag: 'latest',
        },
        staticPreview: {
          label: 'downloads',
          message: '2k',
          color: 'brightgreen',
        },
        documentation,
      },
      {
        title: 'GitHub Releases (by Release)',
        pattern: 'downloads/:user/:repo/:tag/total',
        namedParams: {
          user: 'atom',
          repo: 'atom',
          tag: 'v0.190.0',
        },
        staticPreview: {
          label: 'downloads',
          message: '490k v0.190.0',
          color: 'brightgreen',
        },
        documentation,
      },
      {
        title: 'GitHub Releases (by Asset)',
        pattern: 'downloads/:user/:repo/:tag/:path',
        namedParams: {
          user: 'atom',
          repo: 'atom',
          tag: 'latest',
          path: 'atom-amd64.deb',
        },
        staticPreview: {
          label: 'downloads',
          message: '3k [atom-amd64.deb]',
          color: 'brightgreen',
        },
        documentation,
      },
      {
        title: 'GitHub Pre-Releases (by Asset)',
        pattern: 'downloads-pre/:user/:repo/:tag/:path',
        namedParams: {
          user: 'atom',
          repo: 'atom',
          tag: 'latest',
          path: 'atom-amd64.deb',
        },
        staticPreview: {
          label: 'downloads',
          message: '237 [atom-amd64.deb]',
          color: 'brightgreen',
        },
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/(downloads|downloads-pre)\/([^/]+)\/([^/]+)(\/.+)?\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const type = match[1] // downloads or downloads-pre
        const user = match[2] // eg, qubyte/rubidium
        const repo = match[3]

        let tag = match[4] // eg, v0.190.0, latest, null if querying all releases
        const assetName = match[5].toLowerCase() // eg. total, atom-amd64.deb, atom.x86_64.rpm
        const format = match[6]

        if (tag) {
          tag = tag.slice(1)
        }

        let total = true
        if (tag) {
          total = false
        }

        let apiUrl = `/repos/${user}/${repo}/releases`
        if (!total) {
          const releasePath =
            tag === 'latest'
              ? type === 'downloads'
                ? 'latest'
                : ''
              : `tags/${tag}`
          if (releasePath) {
            apiUrl = `${apiUrl}/${releasePath}`
          }
        }
        const badgeData = getBadgeData('downloads', data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
        }
        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (
            githubCheckErrorResponse(
              badgeData,
              err,
              res,
              'repo or release not found'
            )
          ) {
            sendBadge(format, badgeData)
            return
          }
          try {
            let data = JSON.parse(buffer)
            if (type === 'downloads-pre' && tag === 'latest') {
              data = data[0]
            }
            let downloads = 0

            const labelWords = []
            if (total) {
              data.forEach(tagData => {
                tagData.assets.forEach(asset => {
                  if (
                    assetName === 'total' ||
                    assetName === asset.name.toLowerCase()
                  ) {
                    downloads += asset.download_count
                  }
                })
              })

              labelWords.push('total')
              if (assetName !== 'total') {
                labelWords.push(`[${assetName}]`)
              }
            } else {
              data.assets.forEach(asset => {
                if (
                  assetName === 'total' ||
                  assetName === asset.name.toLowerCase()
                ) {
                  downloads += asset.download_count
                }
              })

              if (tag !== 'latest') {
                labelWords.push(tag)
              }
              if (assetName !== 'total') {
                labelWords.push(`[${assetName}]`)
              }
            }
            labelWords.unshift(metric(downloads))
            badgeData.text[1] = labelWords.join(' ')
            badgeData.colorscheme = 'brightgreen'
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
