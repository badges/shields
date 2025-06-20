import { deprecatedService } from '../index.js'

export const PubPopularity = deprecatedService({
  category: 'rating',
  route: {
    base: 'pub/popularity',
    pattern: ':packageName',
  },
  label: 'popularity',
  dateAdded: new Date('2025-05-11'),
})
