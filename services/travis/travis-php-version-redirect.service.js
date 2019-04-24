'use strict'

const { redirector } = require('..')

module.exports = redirector({
  category: 'platform-support',
  route: {
    base: 'travis-ci/php-v',
    pattern: ':user/:repo/:branch*',
  },
  transformPath: ({ user, repo, branch }) =>
    branch
      ? `/travis/php-v/${user}/${repo}/${branch}`
      : `/travis/php-v/${user}/${repo}`,
  dateAdded: new Date('2019-04-22'),
})
