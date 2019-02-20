'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'build',
  route: {
    format: 'snap(?:-ci?)/(?:[^/]+/[^/]+)(?:/(?:.+))',
  },
  label: 'snap ci',
  dateAdded: new Date('2018-01-23'),
})
