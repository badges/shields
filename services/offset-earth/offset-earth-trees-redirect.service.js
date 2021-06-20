import { redirector } from '../index.js'

export default [
  // https://github.com/badges/shields/issues/5433
  redirector({
    name: 'OffsetEarthTreesRedirect',
    category: 'other',
    route: {
      base: 'offset-earth/trees',
      pattern: ':username',
    },
    transformPath: ({ username }) => `/ecologi/trees/${username}`,
    dateAdded: new Date('2020-08-16'),
  }),
]
