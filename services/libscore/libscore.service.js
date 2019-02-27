'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'rating',
  route: {
    base: 'libscore/s',
    pattern: ':various+',
  },
  label: 'libscore',
  dateAdded: new Date('2018-09-22'),
})
