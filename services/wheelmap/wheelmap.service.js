import { deprecatedService } from '../index.js'

export const Wheelmap = deprecatedService({
  category: 'other',
  route: {
    base: 'wheelmap/a',
    pattern: ':nodeId',
  },
  label: 'wheelmap',
  dateAdded: new Date('2024-09-14'),
})
