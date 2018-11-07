'use strict'

const deprecatedService = require('../deprecated-service')

module.exports = deprecatedService({
  url: {
    format: 'snap(?:-ci?)/(?:[^/]+/[^/]+)(?:/(?:.+))',
  },
  label: 'snap ci',
})
