'use strict'

const { deprecatedService } = require('..')

// coverity on demand integration - deprecated as of December 2018.
module.exports = deprecatedService({
  url: {
    base: 'coverity/ondemand',
    format: '(?:.+)',
  },
  label: 'coverity',
  category: 'analysis',
})
