'use strict'

const deprecatedService = require('../deprecated-service')

module.exports = deprecatedService({
  category: 'dependencies',
  url: {
    base: 'gemnasium',
    format: '(?:.+)',
  },
  label: 'gemnasium',
})
