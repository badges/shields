import { deprecatedService } from '../../index.js'

export default deprecatedService({
  category: 'social',
  label: 'github',
  route: { base: 'github/stars/gists', pattern: ':gistId' },
  dateAdded: new Date('2025-12-20'),
  issueUrl: 'https://github.com/badges/shields/pull/11583',
})
