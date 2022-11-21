import { withRegex } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Polymart Plugin (id 323)')
  .get('/323.json')
  .expectBadge({
    label: 'version',
    message: withRegex(/^(?!not found$)/),
  })

t.create('Invalid Resource (id 0)').get('/0.json').expectBadge({
  label: 'version',
  message: 'not found',
})
