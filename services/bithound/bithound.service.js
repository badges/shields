'use strict'

const deprecatedService = require('../deprecated-service')

// bitHound integration - deprecated as of July 2018
module.exports = deprecatedService({
  category: 'dependencies',
  url: {
    base: 'bithound',
    format: '(?:code/|dependencies/|devDependencies/)?(?:.+?)',
  },
  label: 'bithound',
})
