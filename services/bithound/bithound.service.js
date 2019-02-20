'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'dependencies',
  route: {
    base: 'bithound',
    format: '(?:code/|dependencies/|devDependencies/)?(?:.+?)',
  },
  label: 'bithound',
  dateAdded: new Date('2018-07-08'),
})
