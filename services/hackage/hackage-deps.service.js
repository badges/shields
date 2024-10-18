import { deprecatedService } from '../index.js'

export const HackageDeps = deprecatedService({
  category: 'dependencies',
  route: {
    base: 'hackage-deps/v',
    pattern: ':packageName',
  },
  label: 'hackagedeps',
  dateAdded: new Date('2024-10-18'),
})
