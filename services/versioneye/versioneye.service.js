'use strict'

const { deprecatedService } = require('..')

// VersionEye integration - deprecated as of August 2018.
module.exports = deprecatedService({
  category: 'downloads',
  route: {
    base: 'versioneye',
    format: 'd/(?:.+)',
  },
  label: 'versioneye',
})
