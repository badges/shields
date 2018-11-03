'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')

module.exports = class BitbucketPipelines extends LegacyService {
  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'bitbucket/pipelines',
    }
  }

  static get examples() {
    return [
      {
        title: 'Bitbucket Pipelines',
        previewUrl: 'atlassian/adf-builder-javascript',
      },
      {
        title: 'Bitbucket Pipelines branch',
        previewUrl: 'atlassian/adf-builder-javascript/task/SECO-2168',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/bitbucket\/pipelines\/([^/]+)\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const user = match[1] // eg, atlassian
        const repo = match[2] // eg, adf-builder-javascript
        const branch = match[3] || 'master' // eg, development
        const format = match[4]
        const apiUrl =
          `https://api.bitbucket.org/2.0/repositories/${encodeURIComponent(
            user
          )}/${encodeURIComponent(
            repo
          )}/pipelines/?fields=values.state&page=1&pagelen=2&sort=-created_on` +
          `&target.ref_type=BRANCH&target.ref_name=${encodeURIComponent(
            branch
          )}`

        const badgeData = getBadgeData('build', data)

        request(apiUrl, (err, res, buffer) => {
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            if (!data.values) {
              throw Error('Unexpected response')
            }
            const values = data.values.filter(
              value => value.state && value.state.name === 'COMPLETED'
            )
            if (values.length > 0) {
              switch (values[0].state.result.name) {
                case 'SUCCESSFUL':
                  badgeData.text[1] = 'passing'
                  badgeData.colorscheme = 'brightgreen'
                  break
                case 'FAILED':
                  badgeData.text[1] = 'failing'
                  badgeData.colorscheme = 'red'
                  break
                case 'ERROR':
                  badgeData.text[1] = 'error'
                  badgeData.colorscheme = 'red'
                  break
                case 'STOPPED':
                  badgeData.text[1] = 'stopped'
                  badgeData.colorscheme = 'yellow'
                  break
                case 'EXPIRED':
                  badgeData.text[1] = 'expired'
                  badgeData.colorscheme = 'yellow'
                  break
                default:
                  badgeData.text[1] = 'unknown'
              }
            } else {
              badgeData.text[1] = 'never built'
            }
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
