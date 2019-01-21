'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'issue-tracking',
  url: {
    base: 'issuestats',
    format: '(?:[^/]+)(?:/long)?/(?:[^/]+)/(?:.+)',
  },
  label: 'issue stats',
})
