'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'build',
  route: {
    base: 'magnumci/ci',
    pattern: ':various+',
  },
  label: 'magnum ci',
  dateAdded: new Date('2018-07-08'),
})
