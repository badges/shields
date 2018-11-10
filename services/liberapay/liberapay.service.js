'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')
const { makeLogo: getLogo } = require('../../lib/badge-data')
const { colorScale } = require('../../lib/color-formatters')

module.exports = class Liberapay extends LegacyService {
  static get category() {
    return 'funding'
  }

  static get route() {
    return {
      base: 'liberapay',
    }
  }

  static get examples() {
    return [
      {
        title: 'Liberapay receiving',
        previewUrl: 'receives/Changaco',
      },
      {
        title: 'Liberapay giving',
        previewUrl: 'gives/Changaco',
      },
      {
        title: 'Liberapay patrons',
        previewUrl: 'patrons/Changaco',
      },
      {
        title: 'Liberapay goal progress',
        previewUrl: 'goal/Changaco',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/liberapay\/(receives|gives|patrons|goal)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const type = match[1] // e.g., 'gives'
        const entity = match[2] // e.g., 'Changaco'
        const format = match[3]
        const apiUrl = `https://liberapay.com/${entity}/public.json`
        // Lock down type
        const label = {
          receives: 'receives',
          gives: 'gives',
          patrons: 'patrons',
          goal: 'goal progress',
        }[type]
        const badgeData = getBadgeData(label, data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('liberapay', data)
        }
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            let value
            let currency
            switch (type) {
              case 'receives':
                if (data.receiving) {
                  value = data.receiving.amount
                  currency = data.receiving.currency
                  badgeData.text[1] = `${metric(value)} ${currency}/week`
                }
                break
              case 'gives':
                if (data.giving) {
                  value = data.giving.amount
                  currency = data.giving.currency
                  badgeData.text[1] = `${metric(value)} ${currency}/week`
                }
                break
              case 'patrons':
                value = data.npatrons
                badgeData.text[1] = metric(value)
                break
              case 'goal':
                if (data.goal) {
                  value = Math.round(
                    (data.receiving.amount / data.goal.amount) * 100
                  )
                  badgeData.text[1] = `${value}%`
                }
                break
            }
            if (value != null) {
              badgeData.colorscheme = colorScale([0, 10, 100])(value)
              sendBadge(format, badgeData)
            } else {
              badgeData.text[1] = 'anonymous'
              badgeData.colorscheme = 'blue'
              sendBadge(format, badgeData)
            }
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
