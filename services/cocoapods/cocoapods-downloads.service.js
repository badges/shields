'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'downloads',
  url: {
    base: 'cocoapods',
    pattern: ':interval(dm|dw|dt)/:spec',
  },
  label: 'downloads',
})
