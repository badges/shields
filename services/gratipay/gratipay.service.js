'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'funding',
  url: {
    format: '(?:gittip|gratipay(?:/user|/team|/project)?)/(?:.*)',
  },
  label: 'gratipay',
})
