'use strict'

const deprecatedService = require('../deprecated-service')

module.exports = deprecatedService({
  category: 'funding',
  url: {
    format: '(?:gittip|gratipay(?:/user|/team|/project)?)/(?:.*)',
  },
  label: 'gratipay',
})
