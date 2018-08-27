'use strict'

const LegacyService = require('../legacy-service')
const { getDeprecatedBadge } = require('../../lib/deprecation-helpers')
const { makeLogo: getLogo } = require('../../lib/badge-data')

module.exports = class Gratipay extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/(?:gittip|gratipay(\/user|\/team|\/project)?)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((queryParams, match, sendBadge, request) => {
        const format = match[3]
        const badgeData = getDeprecatedBadge('gratipay', queryParams)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('gratipay', queryParams)
        }
        sendBadge(format, badgeData)
      })
    )
  }
}
