'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    category: 'chat',
    route: {
      base: 'discourse',
      pattern: ':protocol(http|https)/:hostAndPath(.+)/:metric',
    },
    transformPath: ({ metric }) => `/discourse/${metric}`,
    transformQueryParams: ({ protocol, hostAndPath }) => ({
      server: `${protocol}://${hostAndPath}`,
    }),
    dateAdded: new Date('2019-09-15'),
  }),
]
