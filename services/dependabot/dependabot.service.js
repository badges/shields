import { deprecatedService } from '../index.js'

export default [
  deprecatedService({
    category: 'analysis',
    route: {
      base: 'dependabot/semver',
      pattern: ':various+',
    },
    label: 'dependabot',
    dateAdded: new Date('2021-11-15'),
  }),
]
