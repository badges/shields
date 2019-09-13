'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    category: 'issue-tracking',
    route: {
      base: 'jira/issue',
      pattern: ':protocol(http|https)/:hostAndPath(.+)/:issueKey',
    },
    transformPath: ({ issueKey }) => `/jira/issue/${issueKey}`,
    transformQueryParams: ({ protocol, hostAndPath }) => ({
      hostUrl: `${protocol}://${hostAndPath}`,
    }),
    dateAdded: new Date('2019-09-14'),
  }),
]
