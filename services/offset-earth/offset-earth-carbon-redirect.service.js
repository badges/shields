import { redirector } from '../index.js'

export default [
  // https://github.com/badges/shields/issues/5433
  redirector({
    name: 'OffsetEarthCarbonRedirect',
    category: 'other',
    route: {
      base: 'offset-earth/carbon',
      pattern: ':username',
    },
    transformPath: ({ username }) => `/ecologi/carbon/${username}`,
    dateAdded: new Date('2020-08-16'),
  }),
]
