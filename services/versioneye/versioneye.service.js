'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'downloads',
  route: {
    base: 'versioneye',
    format: 'd/(?:.+)',
  },
  label: 'versioneye',
  dateAdded: new Date('2018-08-20'),
})
