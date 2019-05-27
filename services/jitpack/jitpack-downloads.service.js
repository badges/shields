'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  route: {
    base: 'jitpack',
    pattern: ':period(dw|dm)/:various*',
  },
  message: 'temporarily unavailable',
  label: 'downloads',
  category: 'downloads',
  dateAdded: new Date('2019-05-27'),
})
