import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('last update date').get('/notepad4e.json').expectBadge({
  label: 'updated',
  message: isFormattedDate,
})

t.create('last update for unknown solution')
  .get('/this-does-not-exist.json')
  .expectBadge({
    label: 'updated',
    message: 'solution not found',
  })
