'use strict'

const { makeBadgeData, setBadgeColor } = require('./badge-data')
const { deprecatedServices } = require('./deprecated-services')

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

module.exports = {
  isDeprecated,
  getDeprecatedBadge,
}
