import { nonNegativeInteger } from '../validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets amount of backers in specified tier')
  .get('/shields/2988.json')
  .expectBadge({
    label: 'monthly backers',
    message: nonNegativeInteger,
  })

t.create('handles not found correctly')
  .get('/nonexistent-collective/1234.json')
  .expectBadge({
    label: 'open collective',
    message: 'No collective found with slug nonexistent-collective',
    color: 'lightgrey',
  })
