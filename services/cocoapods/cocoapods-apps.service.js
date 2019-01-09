'use strict'

const deprecatedService = require('../deprecated-service')

module.exports = deprecatedService({
  category: 'other',
  url: {
    base: 'cocoapods',
    pattern: ':interval(aw|at)/:spec',
  },
  label: 'apps',
})
