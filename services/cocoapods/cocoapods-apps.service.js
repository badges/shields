'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'other',
  route: {
    base: 'cocoapods',
    pattern: ':interval(aw|at)/:spec',
  },
  label: 'apps',
})
