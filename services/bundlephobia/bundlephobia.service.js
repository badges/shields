'use strict'

const prettyBytes = require('pretty-bytes')
const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

// Bundle size for npm packages.
module.exports = class Bundlephobia extends LegacyService {
  static get category() {
    return 'size'
  }

  static get route() {
    return {
      base: 'bundlephobia',
    }
  }

  static get examples() {
    return [
      {
        title: 'npm bundle size (minified)',
        previewUrl: 'min/react',
        keywords: ['node'],
      },
      {
        title: 'npm bundle size (minified + gzip)',
        previewUrl: 'minzip/react',
        keywords: ['node'],
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/bundlephobia\/(min|minzip)\/(?:@([^/]+)?\/)?([^/]+)?(?:\/([^/]+)?)?\.(svg|png|gif|jpg|json)?$/,
      cache((data, match, sendBadge, request) => {
        // A: /bundlephobia/(min|minzip)/:package.:format
        // B: /bundlephobia/(min|minzip)/:package/:version.:format
        // C: /bundlephobia/(min|minzip)/@:scope/:package.:format
        // D: /bundlephobia/(min|minzip)/@:scope/:package/:version.:format
        const resultType = match[1]
        const scope = match[2]
        const packageName = match[3]
        const packageVersion = match[4]
        const format = match[5]
        const showMin = resultType === 'min'

        const badgeData = getBadgeData(
          showMin ? 'minified size' : 'minzipped size',
          data
        )

        let packageString =
          typeof scope === 'string' ? `@${scope}/${packageName}` : packageName

        if (packageVersion) {
          packageString += `@${packageVersion}`
        }

        const requestOptions = {
          url: 'https://bundlephobia.com/api/size',
          qs: {
            package: packageString,
          },
          json: true,
        }

        /**
         * `ErrorCode` => `error code`
         * @param {string} code
         * @returns {string}
         */
        const formatErrorCode = code =>
          code
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()

        request(requestOptions, (error, response, body) => {
          if (typeof body !== 'object' || body === null) {
            badgeData.text[1] = 'error'
            badgeData.colorscheme = 'red'
          } else if (error !== null || body.error) {
            badgeData.text[1] =
              'code' in body.error ? formatErrorCode(body.error.code) : 'error'
            badgeData.colorscheme = 'red'
          } else {
            badgeData.text[1] = prettyBytes(showMin ? body.size : body.gzip)
            badgeData.colorscheme = 'blue'
          }
          sendBadge(format, badgeData)
        })
      })
    )
  }
}
