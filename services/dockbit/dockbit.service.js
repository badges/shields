'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'build',
  route: {
    base: 'dockbit',
    pattern: ':various+',
  },
  label: 'dockbit',
  dateAdded: new Date('2017-12-31'),
})
