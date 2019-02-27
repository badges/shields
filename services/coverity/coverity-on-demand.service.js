'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  route: {
    base: 'coverity/ondemand',
    pattern: ':various+',
  },
  label: 'coverity',
  category: 'analysis',
  dateAdded: new Date('2018-12-18'),
})
