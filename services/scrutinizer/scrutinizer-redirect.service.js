'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    category: 'analysis',
    route: {
      base: 'scrutinizer',
      pattern: ':vcs/:user/:repo/:branch*',
    },
    transformPath: ({ vcs, user, repo, branch }) =>
      `/scrutinizer/quality/${vcs}/${user}/${repo}${
        branch ? `/${branch}` : ''
      }`,
    dateAdded: new Date('2019-04-06'),
  }),
]
