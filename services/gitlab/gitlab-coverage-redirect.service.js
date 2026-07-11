import { retiredService } from '../index.js'

export default retiredService({
  category: 'coverage',
  label: 'gitlab',
  route: {
    base: 'gitlab/coverage',
    pattern: ':user/:repo/:branch',
  },
  dateAdded: new Date('2025-12-20'),
  issueUrl: 'https://github.com/badges/shields/pull/11583',
})
