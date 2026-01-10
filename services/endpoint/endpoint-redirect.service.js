import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'other',
  label: 'endpoint',
  route: {
    base: 'badge/endpoint',
    pattern: '',
  },
  dateAdded: new Date('2025-12-20'),
  issueUrl: 'https://github.com/badges/shields/pull/11583',
})
