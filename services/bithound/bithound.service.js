'use strict'

const { deprecatedService } = require('..')

// bitHound integration - deprecated as of July 2018
module.exports = deprecatedService({
  category: 'dependencies',
  route: {
    base: 'bithound',
    format: '(?:code/|dependencies/|devDependencies/)?(?:.+?)',
  },
  label: 'bithound',
})
