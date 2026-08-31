import { retiredService } from '../index.js'

export default [
  retiredService({
    category: 'issue-tracking',
    label: 'jira',
    route: {
      base: 'jira/sprint',
      pattern: ':protocol(http|https)/:hostAndPath(.+)/:sprintId',
    },
    dateAdded: new Date('2025-12-20'),
    issueUrl: 'https://github.com/badges/shields/pull/11583',
  }),
]
