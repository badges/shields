'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class Codeship extends LegacyService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'codeship',
      pattern: ':projectId/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'Codeship',
        pattern: ':projectId',
        namedParams: {
          projectId: 'd6c1ddd0-16a3-0132-5f85-2e35c05e22b1',
        },
        staticPreview: {
          label: 'build',
          message: 'passing',
          color: 'brightgreen',
        },
      },
      {
        title: 'Codeship (branch)',
        pattern: ':projectId/:branch',
        namedParams: {
          projectId: 'd6c1ddd0-16a3-0132-5f85-2e35c05e22b1',
          branch: 'master',
        },
        staticPreview: {
          label: 'build',
          message: 'passing',
          color: 'brightgreen',
        },
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/codeship\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const projectId = match[1] // eg, `ab123456-00c0-0123-42de-6f98765g4h32`.
        const format = match[3]
        const branch = match[2]
        const options = {
          method: 'GET',
          uri: `https://codeship.com/projects/${projectId}/status${
            branch != null ? `?branch=${branch}` : ''
          }`,
        }
        const badgeData = getBadgeData('build', data)
        request(options, (err, res) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const statusMatch = res.headers['content-disposition'].match(
              /filename="status_(.+)\./
            )
            if (!statusMatch) {
              badgeData.text[1] = 'unknown'
              sendBadge(format, badgeData)
              return
            }

            switch (statusMatch[1]) {
              case 'success':
                badgeData.text[1] = 'passing'
                badgeData.colorscheme = 'brightgreen'
                break
              case 'projectnotfound':
                badgeData.text[1] = 'not found'
                break
              case 'branchnotfound':
                badgeData.text[1] = 'branch not found'
                break
              case 'testing':
              case 'waiting':
              case 'initiated':
                badgeData.text[1] = 'pending'
                break
              case 'error':
              case 'infrastructure_failure':
                badgeData.text[1] = 'failing'
                badgeData.colorscheme = 'red'
                break
              case 'stopped':
              case 'ignored':
              case 'blocked':
                badgeData.text[1] = 'not built'
                break
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
