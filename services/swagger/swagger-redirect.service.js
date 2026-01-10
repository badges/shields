import { deprecatedService } from '../index.js'

export default [
  deprecatedService({
    category: 'other',
    label: 'swagger',
    name: 'SwaggerRedirect',
    route: {
      base: 'swagger/valid/2.0',
      pattern: ':scheme(http|https)/:url*',
    },
    dateAdded: new Date('2025-12-20'),
    issueUrl: 'https://github.com/badges/shields/pull/11583',
  }),
]
