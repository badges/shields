'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    category: 'social',
    name: 'TwitterUrlRedirect',
    route: {
      base: 'twitter/url',
      pattern: ':protocol(https|http)/:hostAndPath+',
    },
    transformPath: () => `/twitter/url`,
    transformQueryParams: ({ protocol, hostAndPath }) => ({
      url: `${protocol}://${hostAndPath}`,
    }),
    dateAdded: new Date('2019-09-17'),
  }),
]
