import { retiredService } from '../index.js'

export const BitComponents = retiredService({
  category: 'other',
  route: {
    base: 'bit/collection/total-components',
    pattern: ':owner/:collection',
  },
  label: 'bitcomponents',
  dateAdded: new Date('2025-11-01'),
})
