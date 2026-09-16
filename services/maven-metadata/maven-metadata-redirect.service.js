import { redirector } from '../index.js'

export default redirector({
  category: 'version',
  route: {
    base: 'maven-metadata/v',
    pattern: ':protocol/:hostAndPath+',
  },
  routeEnum: ['http', 'https'],
  transformPath: () => '/maven-metadata/v',
  transformQueryParams: ({ protocol, hostAndPath }) => ({
    metadataUrl: `${protocol}://${hostAndPath}`,
  }),
  dateAdded: new Date('2019-09-16'),
})
