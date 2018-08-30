'use strict'

const deprecatedService = require('../deprecated-service')

module.exports = deprecatedService({
  url: {
    base: 'gemnasium',
    format: '(?:.+)',
  },
  label: 'gemnasium',
})
