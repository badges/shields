'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'issue-tracking',
  route: {
    base: 'issuestats',
    format: '(?:[^/]+)(?:/long)?/(?:[^/]+)/(?:.+)',
  },
  label: 'issue stats',
  dateAdded: new Date('2018-09-01'),
})
