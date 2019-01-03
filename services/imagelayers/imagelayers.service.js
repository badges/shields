'use strict'

const deprecatedService = require('../deprecated-service')

// image layers integration - deprecated as of November 2018.
module.exports = deprecatedService({
  category: 'size',
  url: {
    base: 'imagelayers',
    format: '(?:.+)',
  },
  label: 'imagelayers',
})
