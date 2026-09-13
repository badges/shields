import { retiredService } from '../index.js'

export default [
  retiredService({
    category: 'other',
    label: 'swagger',
    name: 'SwaggerRedirect',
    route: {
      base: 'swagger/valid/2.0',
      pattern: ':scheme/:url*',
    },
    routeEnum: ['http', 'https'],
    dateAdded: new Date('2025-12-20'),
    issueUrl: 'https://github.com/badges/shields/pull/11583',
  }),
]
