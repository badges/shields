import { redirector } from '../index.js'

export default [
  redirector({
    category: 'chat',
    route: {
      base: 'discourse',
      pattern: ':protocol/:hostAndPath(.+)/:metric',
    },
    routeEnum: ['http', 'https'],
    transformPath: ({ metric }) => `/discourse/${metric}`,
    transformQueryParams: ({ protocol, hostAndPath }) => ({
      server: `${protocol}://${hostAndPath}`,
    }),
    dateAdded: new Date('2019-09-15'),
  }),
]
