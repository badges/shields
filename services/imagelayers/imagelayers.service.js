'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'size',
  route: {
    base: 'imagelayers',
    pattern: ':various+',
  },
  label: 'imagelayers',
  dateAdded: new Date('2018-11-18'),
})
