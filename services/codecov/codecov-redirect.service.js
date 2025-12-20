import { deprecatedService } from '../index.js'

export default [
  deprecatedService({
    category: 'coverage',
    label: 'codecov',
    route: {
      base: 'codecov/c',
      pattern:
        'token/:token/:vcsName(github|gh|bitbucket|bb|gl|gitlab)/:user/:repo/:branch*',
    },
    dateAdded: new Date('2025-12-20'),
    issueUrl: 'https://github.com/badges/shields/pull/11583',
  }),
]
