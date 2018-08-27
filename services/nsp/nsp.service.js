'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

module.exports = class Nsp extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/nsp\/npm\/(?:@([^/]+)?\/)?([^/]+)?(?:\/([^/]+)?)?\.(svg|png|gif|jpg|json)?$/,
      cache((data, match, sendBadge, request) => {
        // A: /nsp/npm/:package.:format
        // B: /nsp/npm/:package/:version.:format
        // C: /nsp/npm/@:scope/:package.:format
        // D: /nsp/npm/@:scope/:package/:version.:format
        const badgeData = getBadgeData('nsp', data)
        const capturedScopeWithoutAtSign = match[1]
        const capturedPackageName = match[2]
        const capturedVersion = match[3]
        const capturedFormat = match[4]

        function getNspResults(
          scopeWithoutAtSign = null,
          packageName = '',
          packageVersion = ''
        ) {
          const nspRequestOptions = {
            method: 'POST',
            body: {
              package: {
                name: null,
                version: packageVersion,
              },
            },
            json: true,
          }

          if (typeof scopeWithoutAtSign === 'string') {
            nspRequestOptions.body.package.name = `@${scopeWithoutAtSign}/${packageName}`
          } else {
            nspRequestOptions.body.package.name = packageName
          }

          request(
            'https://api.nodesecurity.io/check',
            nspRequestOptions,
            (error, response, body) => {
              if (error !== null || typeof body !== 'object' || body === null) {
                badgeData.text[1] = 'invalid'
                badgeData.colorscheme = 'red'
              } else if (body.length !== 0) {
                badgeData.text[1] = `${body.length} vulnerabilities`
                badgeData.colorscheme = 'red'
              } else {
                badgeData.text[1] = 'no known vulnerabilities'
                badgeData.colorscheme = 'brightgreen'
              }

              sendBadge(capturedFormat, badgeData)
            }
          )
        }

        function getNpmVersionThenNspResults(
          scopeWithoutAtSign = null,
          packageName = ''
        ) {
          // nsp doesn't properly detect the package version in POST requests so this function gets it for us
          // https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md#getpackageversion
          const npmRequestOptions = {
            headers: {
              Accept: '*/*',
            },
            json: true,
          }
          let npmURL = null

          if (typeof scopeWithoutAtSign === 'string') {
            // Using 'latest' would save bandwidth, but it is currently not supported for scoped packages
            npmURL = `http://registry.npmjs.org/@${scopeWithoutAtSign}%2F${packageName}`
          } else {
            npmURL = `http://registry.npmjs.org/${packageName}/latest`
          }

          request(npmURL, npmRequestOptions, (error, response, body) => {
            if (response !== null && response.statusCode === 404) {
              // NOTE: in POST requests nsp does not distinguish between
              // 'package not found' and 'no known vulnerabilities'.
              // To keep consistency in the use case where a version is provided
              // (which skips `getNpmVersionThenNspResults()` altogether) we'll say
              // 'no known vulnerabilities' since it is technically true in both cases
              badgeData.text[1] = 'no known vulnerabilities'

              sendBadge(capturedFormat, badgeData)
            } else if (
              error !== null ||
              typeof body !== 'object' ||
              body === null
            ) {
              badgeData.text[1] = 'invalid'
              badgeData.colorscheme = 'red'

              sendBadge(capturedFormat, badgeData)
            } else if (typeof body.version === 'string') {
              getNspResults(scopeWithoutAtSign, packageName, body.version)
            } else if (typeof body['dist-tags'] === 'object') {
              getNspResults(
                scopeWithoutAtSign,
                packageName,
                body['dist-tags'].latest
              )
            } else {
              badgeData.text[1] = 'invalid'
              badgeData.colorscheme = 'red'

              sendBadge(capturedFormat, badgeData)
            }
          })
        }

        if (typeof capturedVersion === 'string') {
          getNspResults(
            capturedScopeWithoutAtSign,
            capturedPackageName,
            capturedVersion
          )
        } else {
          getNpmVersionThenNspResults(
            capturedScopeWithoutAtSign,
            capturedPackageName
          )
        }
      })
    )
  }
}
