'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'other',
  url: {
    base: 'cocoapods',
    pattern: ':interval(aw|at)/:spec',
  },
  label: 'apps',
})
