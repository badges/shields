'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  route: {
    base: 'coverity/ondemand',
    format: '(?:.+)',
  },
  label: 'coverity',
  category: 'analysis',
  dateAdded: new Date('2018-12-18'),
})
