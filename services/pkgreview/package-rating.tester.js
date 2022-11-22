import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'pkgreview',
  title: 'PkgReview',
  pathPrefix: '/pkgreview',
})

t.create('Stars Badge')
  .get('/stars/npm/react.json')
  .expectBadge({ label: 'pkgreview', message: 'no longer available' })

t.create('Rating Badge')
  .get('/rating/npm/react.json')
  .expectBadge({ label: 'pkgreview', message: 'no longer available' })
