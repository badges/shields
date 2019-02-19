'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'downloads',
  route: {
    base: 'cocoapods',
    pattern: ':interval(dm|dw|dt)/:spec',
  },
  label: 'downloads',
  dateAdded: new Date('2018-01-06'),
})
