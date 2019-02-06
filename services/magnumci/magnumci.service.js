'use strict'

const { deprecatedService } = require('..')

// Magnum CI integration - deprecated as of July 2018
module.exports = deprecatedService({
  category: 'build',
  route: {
    base: 'magnumci/ci',
    format: '(?:[^/]+)(?:/(?:.+))?',
  },
  label: 'magnum ci',
})
