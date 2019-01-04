'use strict'

const deprecatedService = require('../deprecated-service')

// VersionEye integration - deprecated as of August 2018.
module.exports = deprecatedService({
  category: 'downloads',
  url: {
    base: 'versioneye',
    format: 'd/(?:.+)',
  },
  label: 'versioneye',
})
