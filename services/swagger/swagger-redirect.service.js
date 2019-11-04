'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    category: 'other',
    name: 'SwaggerRedirect',
    route: {
      base: 'swagger/valid/2.0',
      pattern: ':scheme(http|https)/:url*',
    },
    transformPath: () => `/swagger/valid/3.0`,
    transformQueryParams: ({ scheme, url }) => {
      const suffix = /(yaml|yml|json)$/.test(url) ? '' : '.json'
      return { specUrl: `${scheme}://${url}${suffix}` }
    },
    dateAdded: new Date('2019-11-03'),
  }),
]
