import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('last update date').get('/com.google.guava/guava.json').expectBadge({
  label: 'last updated',
  message: isFormattedDate,
})

t.create('last update when artifact not found')
  .get('/com.fail.test/this-does-not-exist.json')
  .expectBadge({
    label: 'last updated',
    message: 'artifact not found',
  })
