'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'dependencies',
  url: {
    base: 'gemnasium',
    format: '(?:.+)',
  },
  label: 'gemnasium',
})
