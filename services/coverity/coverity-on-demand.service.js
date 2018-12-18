'use strict'

const deprecatedService = require('../deprecated-service')

// coverity on demand integration - deprecated as of December 2018.
module.exports = deprecatedService({
  url: {
    base: 'coverity/ondemand',
    format: '(?:.+)',
  },
  label: 'coverity',
  category: 'quality',
})
