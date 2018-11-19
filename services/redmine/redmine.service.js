'use strict'

const xml2js = require('xml2js')
const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { starRating } = require('../../lib/text-formatters')
const { floorCount: floorCountColor } = require('../../lib/color-formatters')

module.exports = class Redmine extends LegacyService {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'redmine/plugin',
    }
  }

  static get examples() {
    return [
      {
        title: 'Plugin on redmine.org',
        previewUrl: 'rating/redmine_xlsx_format_issue_exporter',
        keywords: ['redmine', 'plugin'],
      },
      {
        title: 'Plugin on redmine.org',
        previewUrl: 'stars/redmine_xlsx_format_issue_exporter',
        keywords: ['redmine', 'plugin'],
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/redmine\/plugin\/(rating|stars)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const type = match[1]
        const plugin = match[2]
        const format = match[3]
        const options = {
          method: 'GET',
          uri: `https://www.redmine.org/plugins/${plugin}.xml`,
        }

        const badgeData = getBadgeData(type, data)
        request(options, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }

          // eslint-disable-next-line handle-callback-err
          xml2js.parseString(buffer.toString(), (err, data) => {
            try {
              const rating = data['redmine-plugin']['ratings-average'][0]._
              badgeData.colorscheme = floorCountColor(rating, 2, 3, 4)

              switch (type) {
                case 'rating':
                  badgeData.text[1] = `${rating}/5.0`
                  break
                case 'stars':
                  badgeData.text[1] = starRating(Math.round(rating))
                  break
              }

              sendBadge(format, badgeData)
            } catch (e) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            }
          })
        })
      })
    )
  }
}
