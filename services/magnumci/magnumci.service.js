'use strict'

const deprecatedService = require('../deprecated-service')

// Magnum CI integration - deprecated as of July 2018
module.exports = deprecatedService({
  category: 'build',
  url: {
    base: 'magnumci/ci',
    format: '(?:[^/]+)(?:/(?:.+))?',
  },
  label: 'magnum ci',
})
