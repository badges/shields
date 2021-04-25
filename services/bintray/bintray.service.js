'use strict'

const { deprecatedService } = require('..')

module.exports = [
  deprecatedService({
    category: 'downloads',
    route: {
      base: 'bintray/dt',
      pattern: ':various+',
    },
    label: 'bintray',
    dateAdded: new Date('2021-04-24'),
  }),
  deprecatedService({
    category: 'version',
    route: {
      base: 'bintray/v',
      pattern: ':various+',
    },
    label: 'bintray',
    dateAdded: new Date('2021-04-24'),
  }),
]
