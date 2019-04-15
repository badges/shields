'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
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
    category: 'coverage',
    route: {
      base: 'codeclimate',
      pattern: ':user/:repo',
    },
    transformPath: ({ user, repo }) => `/codeclimate/coverage/${user}/${repo}`,
    dateAdded: new Date('2019-04-15'),
  }),
]
