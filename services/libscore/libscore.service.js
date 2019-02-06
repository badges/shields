'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'rating',
  route: {
    base: 'libscore',
    format: 's/(?:.+)',
  },
  label: 'libscore',
})
