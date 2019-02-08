'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'downloads',
  route: {
    base: 'cocoapods',
    pattern: ':interval(dm|dw|dt)/:spec',
  },
  label: 'downloads',
})
