import { redirector } from '../index.js'

export default [
  redirector({
    category: 'coverage',
    route: {
      base: 'teamcity/coverage',
      pattern: ':protocol(http|https)/:hostAndPath(.+)/:buildId',
    },
    transformPath: ({ buildId }) => `/teamcity/coverage/${buildId}`,
    transformQueryParams: ({ protocol, hostAndPath }) => ({
      server: `${protocol}://${hostAndPath}`,
    }),
    dateAdded: new Date('2019-09-15'),
  }),
]
