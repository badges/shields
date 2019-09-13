'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    category: 'issue-tracking',
    route: {
      base: 'jira/sprint',
      pattern: ':protocol(http|https)/:hostAndPath(.+)/:sprintId',
    },
    transformPath: ({ sprintId }) => `/jira/sprint/${sprintId}`,
    transformQueryParams: ({ protocol, hostAndPath }) => ({
      hostUrl: `${protocol}://${hostAndPath}`,
    }),
    dateAdded: new Date('2019-09-14'),
  }),
]
