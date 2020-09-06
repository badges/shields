'use strict'

const { deprecatedService } = require('..')

module.exports = [
  deprecatedService({
    category: 'funding',
    label: 'codetally',
    route: {
      base: 'codetally',
      pattern: ':owner/:repo',
    },
    dateAdded: new Date('2020-09-05'),
  }),
]
