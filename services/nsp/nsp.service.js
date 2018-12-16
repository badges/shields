'use strict'

const deprecatedService = require('../deprecated-service')

// nsp integration - deprecated as of December 2018.
module.exports = deprecatedService({
  url: {
    base: 'nsp/npm',
    format: '(?:.+)',
  },
  label: 'nsp',
  category: 'other',
})
