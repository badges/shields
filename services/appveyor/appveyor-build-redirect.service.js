'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    category: 'build',
    route: {
      base: 'appveyor/ci',
      pattern: ':user/:repo/:branch*',
    },
    transformPath: ({ user, repo, branch }) =>
      `/appveyor/build/${user}/${repo}${branch ? `/${branch}` : ''}`,
    dateAdded: new Date('2019-12-10'),
  }),
]
