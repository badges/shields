'use strict'

const { makeBadgeData, setBadgeColor } = require('./badge-data')
const { deprecatedServices } = require('./deprecated-services')
const { Deprecated } = require('../services/errors')

const isDeprecated = function(
  service,
  now = new Date(),
  depServices = deprecatedServices
) {
  if (!(service in depServices)) {
    return false
  }
  return now.getTime() >= depServices[service].getTime()
}

const getDeprecatedBadge = function(label, data) {
  const badgeData = makeBadgeData(label, data)
  setBadgeColor(badgeData, 'lightgray')
  badgeData.text[1] = 'no longer available'
  return badgeData
}

function enforceDeprecation(effectiveDate) {
  if (Date.now() >= effectiveDate.getTime()) {
    throw new Deprecated()
  }
}

module.exports = {
  isDeprecated,
  getDeprecatedBadge,
  enforceDeprecation,
}
