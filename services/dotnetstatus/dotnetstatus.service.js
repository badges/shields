'use strict'

const deprecatedService = require('../deprecated-service')

// dotnet-status integration - deprecated as of April 2018.
module.exports = deprecatedService({
  url: {
    base: 'dotnetstatus',
    format: '(?:.+)',
  },
  label: 'dotnet status',
})
