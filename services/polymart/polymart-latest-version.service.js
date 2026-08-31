import redirector from '../../core/base-service/redirector.js'

export default redirector({
  category: 'version',
  route: {
    base: 'polymart/version',
    pattern: ':resourceId',
  },
  transformPath: ({ resourceId }) => `/voxel-shop/v/${resourceId}`,
  dateAdded: new Date('2026-04-05'),
})
