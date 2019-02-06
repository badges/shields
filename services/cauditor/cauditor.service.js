'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'other',
  route: {
    base: 'cauditor',
    format: '(?:mi|ccn|npath|hi|i|ca|ce|dit)/(?:[^/]+)/(?:[^/]+)/(?:.+)',
  },
  label: 'cauditor',
})
