'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    category: 'other',
    name: 'SwaggerUrlRedirect',
    route: {
      base: 'swagger/valid/2.0',
      pattern: ':scheme(http|https)/:url',
    },
    transformPath: () => `/swagger/valid/3.0/spec`,
    transformQueryParams: ({ scheme, url }) => ({
      url: `${scheme}://${url}`,
    }),
    dateAdded: new Date('2019-11-03'),
  }),
]
