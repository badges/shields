'use strict'

const { deprecatedService } = require('..')

const commonAttrs = {
  category: 'funding',
  label: 'gratipay',
  dateAdded: new Date('2017-12-29'),
}

module.exports = [
  deprecatedService({
    route: {
      base: 'gittip',
      format: '(?:/user|/team|/project)?/(?:.*)',
    },
    ...commonAttrs,
  }),
  deprecatedService({
    route: {
      base: 'gratipay',
      format: '(?:/user|/team|/project)?/(?:.*)',
    },
    ...commonAttrs,
  }),
]
