import { deprecatedService } from '../index.js'

export const Bountysource = deprecatedService({
  category: 'funding',
  route: {
    base: 'bountysource/team',
    pattern: ':team/activity',
  },
  label: 'bountysource',
  dateAdded: new Date('2024-07-18'),
})
