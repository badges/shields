'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    category: 'coverage',
    route: {
      base: 'teamcity/coverage',
      pattern: ':protocol(http|https)/:hostAndPath(.+)/:buildId',
    },
    transformPath: ({ buildId }) => `/teamcity/coverage/${buildId}`,
    transformQueryParams: ({ protocol, hostAndPath }) => ({
      hostUrl: `${protocol}://${hostAndPath}`,
    }),
    dateAdded: new Date('2019-09-15'),
  }),
]
