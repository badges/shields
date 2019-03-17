'use strict'

const { redirector } = require('..')

module.exports = redirector({
  category: 'version',
  route: {
    base: 'github/release',
    pattern: ':user/:repo/all',
  },
  transformPath: ({ user, repo }) => `/github/release-pre/${user}/${repo}`,
  dateAdded: new Date('2019-02-24'),
})
