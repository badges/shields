import { deprecatedService } from '../index.js'

// https://github.com/badges/shields/issues/8138
export default deprecatedService({
  category: 'build',
  label: 'gitlab',
  route: {
    base: 'gitlab/v/contributor',
    pattern: ':project+',
  },
  dateAdded: new Date('2025-12-20'),
  issueUrl: 'https://github.com/badges/shields/pull/11583',
})
