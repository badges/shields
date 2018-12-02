'use strict'

const deprecatedService = require('../deprecated-service')
// dockbit integration - deprecated as of December 2017.
module.exports = deprecatedService({
  url: {
    base: 'dockbit',
    format: '(?:.+)',
  },
  label: 'dockbit',
})
