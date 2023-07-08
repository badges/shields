import { nonNegativeInteger } from '../validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets amount of sponsors').get('/shields.json').expectBadge({
  label: 'sponsors',
  message: nonNegativeInteger,
  color: 'brightgreen',
})

t.create('handles not found correctly')
  .get('/nonexistent-collective.json')
  .expectBadge({
    label: 'sponsors',
    message: 'No collective found with slug nonexistent-collective',
    color: 'lightgrey',
  })
