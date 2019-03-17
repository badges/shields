'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'dependencies',
  route: {
    base: 'gemnasium',
    pattern: ':various+',
  },
  label: 'gemnasium',
  dateAdded: new Date('2018-05-15'),
})
