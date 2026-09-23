import { retiredService } from '../index.js'

export default [
  retiredService({
    category: 'issue-tracking',
    label: 'github',
    route: {
      base: 'github',
      pattern: ':issueKind/detail/:variant/:user/:repo/:number',
    },
    dateAdded: new Date('2025-12-20'),
    issueUrl: 'https://github.com/badges/shields/pull/11583',
  }),
]
