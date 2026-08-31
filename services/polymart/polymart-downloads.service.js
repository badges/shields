import redirector from '../../core/base-service/redirector.js'

export default redirector({
  category: 'downloads',
  route: {
    base: 'polymart/downloads',
    pattern: ':resourceId',
  },
  transformPath: ({ resourceId }) => `/voxel-shop/dt/${resourceId}`,
  dateAdded: new Date('2026-04-05'),
})
