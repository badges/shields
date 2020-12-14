'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'build',
  route: {
    base: 'continuousphp',
    pattern: ':various+',
  },
  label: 'continuousphp',
  dateAdded: new Date('2020-12-12'),
})
