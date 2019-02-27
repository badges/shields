'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'downloads',
  route: {
    base: 'versioneye/d',
    pattern: ':various+',
  },
  label: 'versioneye',
  dateAdded: new Date('2018-08-20'),
})
