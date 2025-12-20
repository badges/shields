import { deprecatedService } from '../index.js'

export default [
  deprecatedService({
    category: 'issue-tracking',
    label: 'github',
    route: {
      base: 'github',
      pattern:
        ':issueKind(issues|pulls)/detail/:variant(s|u)/:user/:repo/:number([0-9]+)',
    },
    dateAdded: new Date('2025-12-20'),
    issueUrl: 'https://github.com/badges/shields/pull/11583',
  }),
]
