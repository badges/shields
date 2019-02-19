'use strict'

const { deprecatedService } = require('..')

module.exports = deprecatedService({
  category: 'build',
  route: {
    base: 'magnumci/ci',
    format: '(?:[^/]+)(?:/(?:.+))?',
  },
  label: 'magnum ci',
  dateAdded: new Date('2018-07-08'),
})
