'use strict'

const deprecatedService = require('../deprecated-service')

module.exports = deprecatedService({
  url: {
    base: 'libscore',
    format: 's/(?:.+)',
  },
  label: 'libscore',
})
