'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'funding',
  route: {
    format: '(?:gittip|gratipay(?:/user|/team|/project)?)/(?:.*)',
  },
  label: 'gratipay',
  dateAdded: new Date('2017-12-29'),
})
