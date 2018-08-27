'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')

module.exports = class IssueStats extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/issuestats\/([^/]+)(\/long)?\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const type = match[1] // e.g. `i` for Issue or `p` for PR
        const longForm = !!match[2]
        const host = match[3] // e.g. `github`
        const userRepo = match[4] // e.g. `ruby/rails`
        const format = match[5]

        const badgeData = getBadgeData('Issue Stats', data)

        // Maps type name from URL to JSON property name prefix for badge data
        const typeToPropPrefix = {
          i: 'issue',
          p: 'pr',
        }
        const typePropPrefix = typeToPropPrefix[type]
        if (typePropPrefix === undefined) {
          badgeData.text[1] = 'invalid'
          sendBadge(format, badgeData)
          return
        }

        const url = 'http://issuestats.com/' + host + '/' + userRepo
        const qs = { format: 'json' }
        if (!longForm) {
          qs.concise = true
        }
        const options = {
          method: 'GET',
          url: url,
          qs: qs,
          gzip: true,
          json: true,
        }
        request(options, (err, res, json) => {
          if (err != null || res.statusCode >= 500) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
            return
          }

          if (res.statusCode >= 400 || !json || typeof json !== 'object') {
            badgeData.text[1] = 'not found'
            sendBadge(format, badgeData)
            return
          }

          try {
            const label = json[typePropPrefix + '_badge_preamble']
            const value = json[typePropPrefix + '_badge_words']
            const color = json[typePropPrefix + '_badge_color']

            if (label != null) badgeData.text[0] = getLabel(label, data)
            badgeData.text[1] = value || 'invalid'
            if (color != null) badgeData.colorscheme = color

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
