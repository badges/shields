'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'size',
  route: {
    base: 'imagelayers',
    format: '(?:.+)',
  },
  label: 'imagelayers',
  dateAdded: new Date('2018-11-18'),
})
