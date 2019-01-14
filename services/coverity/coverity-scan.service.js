'use strict'

const deprecatedService = require('../deprecated-service')

// coverity scan integration -
// **temporarily deprecated as of January 2019 due to extended outage**
// https://community.synopsys.com/s/article/Coverity-Scan-Update
// https://github.com/badges/shields/issues/2722
module.exports = deprecatedService({
  url: {
    base: 'coverity/scan',
    format: '(?:.+)',
  },
  label: 'coverity',
  category: 'analysis',
  message: 'extended downtime',
})
