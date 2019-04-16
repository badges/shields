'use strict'

const { redirector } = require('..')

// http://github.com/badges/shields/issues/1387
module.exports = [
  redirector({
    name: 'CodeclimateCoverageShortcutRedirect',
    category: 'coverage',
    route: {
      base: 'codeclimate',
      pattern: ':which(c|c-letter)/:user/:repo',
    },
    transformPath: ({ which, user, repo }) =>
      `/codeclimate/${which.replace('c', 'coverage')}/${user}/${repo}`,
    dateAdded: new Date('2019-04-15'),
  }),
  redirector({
    name: 'CodeclimateTopLevelCoverageRedirect',
    category: 'coverage',
    route: {
      base: 'codeclimate',
      pattern: ':user/:repo',
    },
    transformPath: ({ user, repo }) => `/codeclimate/coverage/${user}/${repo}`,
    dateAdded: new Date('2019-04-15'),
  }),
]
