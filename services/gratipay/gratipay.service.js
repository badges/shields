'use strict'

const deprecatedService = require('../deprecated-service')

module.exports = deprecatedService({
  url: {
    format: '(?:gittip|gratipay(?:/user|/team|/project)?)/(?:.*)',
  },
  label: 'gratipay',
})
