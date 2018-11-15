'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')
const { metric, starRating, formatDate } = require('../../lib/text-formatters')
const {
  floorCount: floorCountColor,
  age: ageColor,
} = require('../../lib/color-formatters')

module.exports = class VaadinDirectory extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/vaadin-directory\/(star|stars|status|rating|rc|rating-count|v|version|rd|release-date)\/(.*).(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const type = match[1] // Field required
        const urlIdentifier = match[2] // Name of repository
        const format = match[3] // Format
        // API URL which contains also authentication info
        const apiUrl = `https://vaadin.com/vaadincom/directory-service/components/search/findByUrlIdentifier?projection=summary&urlIdentifier=${urlIdentifier}`

        // Set left-side text to 'Vaadin-Directory' by default
        const badgeData = getBadgeData('vaadin directory', data)
        request(apiUrl, (err, res, buffer) => {
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }

          try {
            const data = JSON.parse(buffer)
            // Round the rating to 1 points decimal
            const rating = (Math.round(data.averageRating * 10) / 10).toFixed(1)
            const ratingCount = data.ratingCount
            const lv = data.latestAvailableRelease.name.toLowerCase()
            const ld = data.latestAvailableRelease.publicationDate
            switch (type) {
              // Since the first deploy was with `star`, I put the case there
              // for safety pre-caution
              case 'star':
              case 'stars': // Stars
                badgeData.text[0] = getLabel('stars', data)
                badgeData.text[1] = starRating(rating)
                badgeData.colorscheme = floorCountColor(rating, 2, 3, 4)
                break
              case 'status': {
                // Status of the component
                const isPublished = data.status.toLowerCase()
                if (isPublished === 'published') {
                  badgeData.text[1] = 'published'
                  badgeData.colorB = '#00b4f0'
                } else {
                  badgeData.text[1] = 'unpublished'
                }
                break
              }
              case 'rating': // rating
                badgeData.text[0] = getLabel('rating', data)
                if (!isNaN(rating)) {
                  badgeData.text[1] = `${rating}/5`
                  badgeData.colorscheme = floorCountColor(rating, 2, 3, 4)
                }
                break
              case 'rc': // rating count
              case 'rating-count':
                badgeData.text[0] = getLabel('rating count', data)
                if (ratingCount && ratingCount !== 0) {
                  badgeData.text[1] = `${metric(data.ratingCount)} total`
                  badgeData.colorscheme = floorCountColor(
                    data.ratingCount,
                    5,
                    50,
                    500
                  )
                }
                break
              case 'v': // latest version
              case 'version':
                badgeData.text[0] = getLabel('latest ver', data)
                badgeData.text[1] = lv
                badgeData.colorB = '#00b4f0'
                break
              case 'rd':
              case 'release-date': // The release date of the latest version
                badgeData.text[0] = getLabel('latest release date', data)
                badgeData.text[1] = formatDate(ld)
                badgeData.colorscheme = ageColor(ld)
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
