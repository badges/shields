'use strict'

const queryString = require('query-string')
const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { fetchFromSvg } = require('../../lib/svg-badge-parser')

module.exports = class CodacyGrade extends LegacyService {
  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'codacy',
    }
  }

  static get examples() {
    return [
      {
        title: 'Codacy grade',
        previewUrl: 'grade/e27821fb6289410b8f58338c7e0bc686',
      },
      {
        title: 'Codacy branch grade',
        previewUrl: 'grade/e27821fb6289410b8f58338c7e0bc686/master',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/codacy\/(?:grade\/)?(?!coverage\/)([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const projectId = match[1] // eg. e27821fb6289410b8f58338c7e0bc686
        const branch = match[2]
        const format = match[3]

        const queryParams = {}
        if (branch) {
          queryParams.branch = branch
        }
        const query = queryString.stringify(queryParams)
        const url = `https://api.codacy.com/project/badge/grade/${projectId}?${query}`
        const badgeData = getBadgeData('code quality', data)
        fetchFromSvg(
          request,
          url,
          /visibility="hidden">([^<>]+)<\/text>/,
          (err, res) => {
            if (err != null) {
              badgeData.text[1] = 'inaccessible'
              sendBadge(format, badgeData)
              return
            }
            try {
              badgeData.text[1] = res
              if (res === 'A') {
                badgeData.colorscheme = 'brightgreen'
              } else if (res === 'B') {
                badgeData.colorscheme = 'green'
              } else if (res === 'C') {
                badgeData.colorscheme = 'yellowgreen'
              } else if (res === 'D') {
                badgeData.colorscheme = 'yellow'
              } else if (res === 'E') {
                badgeData.colorscheme = 'orange'
              } else if (res === 'F') {
                badgeData.colorscheme = 'red'
              } else if (res === 'X') {
                badgeData.text[1] = 'invalid'
                badgeData.colorscheme = 'lightgrey'
              } else {
                badgeData.colorscheme = 'red'
              }
              sendBadge(format, badgeData)
            } catch (e) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            }
          }
        )
      })
    )
  }
}
