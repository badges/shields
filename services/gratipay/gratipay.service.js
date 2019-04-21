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
      pattern: ':various*',
    },
    ...commonAttrs,
  }),
  deprecatedService({
    route: {
      base: 'gratipay',
      pattern: ':various*',
    },
    ...commonAttrs,
  }),
]
