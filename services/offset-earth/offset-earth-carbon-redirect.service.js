import { deprecatedService } from '../index.js'

export default [
  // https://github.com/badges/shields/issues/5433
  deprecatedService({
    name: 'OffsetEarthCarbonRedirect',
    category: 'other',
    label: 'offset-earth',
    route: {
      base: 'offset-earth/carbon',
      pattern: ':username',
    },
    dateAdded: new Date('2025-12-20'),
    issueUrl: 'https://github.com/badges/shields/pull/11583',
  }),
]
