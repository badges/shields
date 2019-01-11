'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class LgtmGrade extends LegacyService {
  static get category() {
    return 'analysis'
  }

  static get route() {
    return {
      base: 'lgtm/grade',
    }
  }

  static get examples() {
    return [
      {
        title: 'LGTM Grade',
        previewUrl: 'java/g/apache/cloudstack',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/lgtm\/grade\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const language = match[1] // eg, `java`
        const projectId = match[2] // eg, `g/apache/cloudstack`
        const format = match[3]
        const url = `https://lgtm.com/api/v0.1/project/${projectId}/details`
        const languageLabel = (() => {
          switch (language) {
            case 'cpp':
              return 'c/c++'
            case 'csharp':
              return 'c#'
            // Javascript analysis on LGTM also includes TypeScript
            case 'javascript':
              return 'js/ts'
            default:
              return language
          }
        })()
        const badgeData = getBadgeData(`code quality: ${languageLabel}`, data)
        request(url, (err, res, buffer) => {
          if (
            checkErrorResponse(badgeData, err, res, {
              404: 'project not found',
            })
          ) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            if (!('languages' in data)) throw new Error('Invalid data')
            for (const languageData of data.languages) {
              if (languageData.lang === language && 'grade' in languageData) {
                // Pretty label for the language
                badgeData.text[1] = languageData.grade
                // Pick colour based on grade
                if (languageData.grade === 'A+') {
                  badgeData.colorscheme = 'brightgreen'
                } else if (languageData.grade === 'A') {
                  badgeData.colorscheme = 'green'
                } else if (languageData.grade === 'B') {
                  badgeData.colorscheme = 'yellowgreen'
                } else if (languageData.grade === 'C') {
                  badgeData.colorscheme = 'yellow'
                } else if (languageData.grade === 'D') {
                  badgeData.colorscheme = 'orange'
                } else {
                  badgeData.colorscheme = 'red'
                }
                sendBadge(format, badgeData)
                return
              }
            }
            badgeData.text[1] = 'no data for language'
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
