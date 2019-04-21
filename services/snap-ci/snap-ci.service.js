'use strict'

const { deprecatedService } = require('..')

const commonAttrs = {
  category: 'build',
  label: 'snap ci',
  dateAdded: new Date('2018-01-23'),
}

module.exports = [
  deprecatedService({
    route: {
      base: 'snap',
      pattern: ':various*',
    },
    ...commonAttrs,
  }),
  deprecatedService({
    route: {
      base: 'snap-ci',
      pattern: ':various*',
    },
    ...commonAttrs,
  }),
]
