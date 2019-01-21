'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'rating',
  url: {
    base: 'libscore',
    format: 's/(?:.+)',
  },
  label: 'libscore',
})
