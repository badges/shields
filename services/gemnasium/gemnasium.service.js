'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'dependencies',
  route: {
    base: 'gemnasium',
    format: '(?:.+)',
  },
  label: 'gemnasium',
})
