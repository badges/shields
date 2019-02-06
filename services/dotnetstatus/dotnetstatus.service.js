'use strict'

const { deprecatedService } = require('..')

// dotnet-status integration - deprecated as of April 2018.
module.exports = deprecatedService({
  category: 'dependencies',
  route: {
    base: 'dotnetstatus',
    format: '(?:.+)',
  },
  label: 'dotnet status',
})
