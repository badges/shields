'use strict'

const deprecatedService = require('../deprecated-service')

module.exports = deprecatedService({
  category: 'issue-tracking',
  url: {
    base: 'issuestats',
    format: '(?:[^/]+)(?:/long)?/(?:[^/]+)/(?:.+)',
  },
  label: 'issue stats',
})
