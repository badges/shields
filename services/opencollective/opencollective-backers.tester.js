import { nonNegativeInteger } from '../validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets amount of backers').get('/shields.json').expectBadge({
  label: 'backers',
  message: nonNegativeInteger,
})

t.create('handles not found correctly')
  .get('/nonexistent-collective.json')
  .expectBadge({
    label: 'backers',
    message: 'No collective found with slug nonexistent-collective',
    color: 'lightgrey',
  })
