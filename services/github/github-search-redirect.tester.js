import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('hit counter on repo')
  .get('/badges/shields/async%20handle.json')
  .expectRedirect(
    '/github/search-code?query=async%20handle+repo%3Abadges%2Fshields',
  )
