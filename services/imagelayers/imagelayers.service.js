'use strict'

const { deprecatedService } = require('..')

// image layers integration - deprecated as of November 2018.
module.exports = deprecatedService({
  category: 'size',
  route: {
    base: 'imagelayers',
    format: '(?:.+)',
  },
  label: 'imagelayers',
})
