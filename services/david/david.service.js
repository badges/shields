import { deprecatedService } from '../index.js'

export default [
  deprecatedService({
    category: 'dependencies',
    route: {
      base: 'david',
      pattern: ':various+',
    },
    label: 'david',
    dateAdded: new Date('2021-10-30'),
  }),
]
