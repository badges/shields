'use strict'

const deprecatedService = require('../deprecated-service')

module.exports = deprecatedService({
  category: 'build',
  url: {
    format: 'snap(?:-ci?)/(?:[^/]+/[^/]+)(?:/(?:.+))',
  },
  label: 'snap ci',
})
