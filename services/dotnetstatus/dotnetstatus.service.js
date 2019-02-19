'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'dependencies',
  route: {
    base: 'dotnetstatus',
    format: '(?:.+)',
  },
  label: 'dotnet status',
  dateAdded: new Date('2018-04-01'),
})
