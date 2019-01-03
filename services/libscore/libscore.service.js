'use strict'

const deprecatedService = require('../deprecated-service')

module.exports = deprecatedService({
  category: 'rating',
  url: {
    base: 'libscore',
    format: 's/(?:.+)',
  },
  label: 'libscore',
})
