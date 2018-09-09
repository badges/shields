'use strict'

const deprecatedService = require('../deprecated-service')

module.exports = deprecatedService({
  url: {
    base: 'cauditor',
    format: '(?:mi|ccn|npath|hi|i|ca|ce|dit)/(?:[^/]+)/(?:[^/]+)/(?:.+)',
  },
  label: 'cauditor',
})
