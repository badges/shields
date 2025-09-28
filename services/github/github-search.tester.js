import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('hit counter')
  .get('/search.json?query=async%20handle')
  .expectBadge({ label: 'async handle counter', message: isMetric })

t.create('hit counter, zero results')
  .get('/search.json?query=async%20handle%20repo%3Abadges%2Fpuppets')
  .expectBadge({
    label: 'async handle repo:badges/puppets counter',
    message: '0',
  })

t.create('legacy redirect')
  .get('/search/badges/shields/async%20handle.svg')
  .expectRedirect(
    '/github/search.svg?query=async%20handle%20repo%3Abadges%2Fshields',
  )
