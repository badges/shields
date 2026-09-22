import redirector from '../../core/base-service/redirector.js'

export default [
  redirector({
    category: 'rating',
    name: 'PolymartRatingRedirect',
    route: {
      base: 'polymart',
      pattern: ':format/:resourceId',
    },
    routeEnum: ['rating', 'stars'],
    transformPath: ({ format, resourceId }) =>
      `/voxel-shop/${format}/${resourceId}`,
    dateAdded: new Date('2026-04-05'),
  }),
]
