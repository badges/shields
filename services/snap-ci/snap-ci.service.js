'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'build',
  url: {
    format: 'snap(?:-ci?)/(?:[^/]+/[^/]+)(?:/(?:.+))',
  },
  label: 'snap ci',
})
