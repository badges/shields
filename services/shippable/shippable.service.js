'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')

module.exports = class Shippable extends LegacyService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'shippable',
    }
  }

  static get examples() {
    return [
      {
        title: 'Shippable',
        pattern: ':projectId',
        exampleUrl: '5444c5ecb904a4b21567b0ff',
        staticExample: { label: 'build', message: 'success', color: '#44CC11' },
      },
      {
        title: 'Shippable branch',
        pattern: ':projectId/:branch',
        exampleUrl: '5444c5ecb904a4b21567b0ff/master',
        staticExample: { label: 'build', message: 'success', color: '#44CC11' },
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/shippable\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        // source: https://github.com/badges/shields/pull/1362#discussion_r161693830
        const statusCodes = {
          0: { color: '#5183A0', label: 'waiting' },
          10: { color: '#5183A0', label: 'queued' },
          20: { color: '#5183A0', label: 'processing' },
          30: { color: '#44CC11', label: 'success' },
          40: { color: '#F8A97D', label: 'skipped' },
          50: { color: '#CEA61B', label: 'unstable' },
          60: { color: '#555555', label: 'timeout' },
          70: { color: '#6BAFBD', label: 'cancelled' },
          80: { color: '#DC5F59', label: 'failed' },
          90: { color: '#555555', label: 'stopped' },
        }

        const projectId = match[1] // eg, 54d119db5ab6cc13528ab183
        let targetBranch = match[2]
        if (targetBranch == null) {
          targetBranch = 'master'
        }
        const format = match[3]
        const url = `https://api.shippable.com/projects/${projectId}/branchRunStatus`
        const options = {
          method: 'GET',
          uri: url,
        }

        const badgeData = getBadgeData('build', data)

        request(options, (err, res, buffer) => {
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            res = JSON.parse(buffer)
            for (const branch of res) {
              if (branch.branchName === targetBranch) {
                badgeData.text[1] = statusCodes[branch.statusCode].label
                badgeData.colorB = statusCodes[branch.statusCode].color
                sendBadge(format, badgeData)
                return
              }
            }
            badgeData.text[1] = 'branch not found'
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
