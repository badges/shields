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
        ':issueKind(issues|pulls)/detail/:which(s|u)/:user/:repo/:number',
    },
    transformPath: ({ which, user, repo, number }) =>
      `/github/issues/detail/${whichMap[which]}/${user}/${repo}/${number}`,
    dateAdded: new Date('2019-04-04'),
  }),
  redirector({
    category: 'issue-tracking',
    route: {
      base: 'github/pulls/detail',
      pattern:
        ':which(state|title|author|label|comments|age|last-update)/:user/:repo/:number',
    },
    transformPath: ({ which, user, repo, number }) =>
      `/github/issues/detail/${which}/${user}/${repo}/${number}`,
    dateAdded: new Date('2019-04-04'),
  }),
]
