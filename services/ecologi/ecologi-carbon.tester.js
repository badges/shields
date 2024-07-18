import { createServiceTester } from '../tester.js'
import { isMetricWithPattern } from '../test-validators.js'
export const t = await createServiceTester()

t.create('request for existing username')
  .get('/ecologi.json')
  .expectBadge({
    label: 'carbon offset',
    message: isMetricWithPattern(/ tonnes/),
  })

t.create('invalid username').get('/non-existent-username.json').expectBadge({
  label: 'carbon offset',
  message: 'username not found',
  color: 'red',
})
