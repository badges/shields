'use strict'

const { deprecatedService } = require('..')
// dockbit integration - deprecated as of December 2017.
module.exports = deprecatedService({
  category: 'build',
  route: {
    base: 'dockbit',
    format: '(?:.+)',
  },
  label: 'dockbit',
})
