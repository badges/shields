import { deprecatedService } from '../index.js'

export const Coincap = deprecatedService({
  category: 'other',
  route: {
    base: 'coincap',
    pattern: ':various+',
  },
  label: 'coincap',
  dateAdded: new Date('2025-05-11'),
})
