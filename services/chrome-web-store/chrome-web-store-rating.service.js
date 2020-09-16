'use strict'

const { deprecatedService } = require('..')

const commonAttrs = {
  category: 'rating',
  label: 'rating',
  dateAdded: new Date('2020-09-06'),
}

module.exports = [
  deprecatedService({
    route: {
      base: 'chrome-web-store/rating',
      pattern: ':storeId',
    },
    ...commonAttrs,
  }),
  deprecatedService({
    route: {
      base: 'chrome-web-store/rating-count',
      pattern: ':storeId',
    },
    ...commonAttrs,
  }),
  deprecatedService({
    route: {
      base: 'chrome-web-store/stars',
      pattern: ':storeId',
    },
    ...commonAttrs,
  }),
]
