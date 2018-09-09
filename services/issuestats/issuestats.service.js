'use strict'

const deprecatedService = require('../deprecated-service')

module.exports = deprecatedService({
  url: {
    base: 'issuestats',
    format: '(?:[^/]+)(?:/long)?/(?:[^/]+)/(?:.+)',
  },
  label: 'issue stats',
})
