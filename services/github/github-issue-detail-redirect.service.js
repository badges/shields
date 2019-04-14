'use strict'

const { redirector } = require('..')

const whichMap = {
  s: 'state',
  u: 'author',
}

module.exports = [
  redirector({
    category: 'issue-tracking',
    route: {
      base: 'github',
      pattern:
        ':issueKind(issues|pulls)/detail/:which(s|u)/:user/:repo/:number([0-9]+)',
    },
    transformPath: ({ issueKind, which, user, repo, number }) =>
      `/github/${issueKind}/detail/${
        whichMap[which]
      }/${user}/${repo}/${number}`,
    dateAdded: new Date('2019-04-04'),
  }),
]
