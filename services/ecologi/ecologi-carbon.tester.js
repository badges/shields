import {createServiceTester} from '../tester.js'
export const t = await createServiceTester()
import {withRegex} from '../test-validators.js';

t.create('request for existing username')
  .get('/ecologi.json')
  .expectBadge({
    label: 'carbon offset',
    message: withRegex(/[\d.]+ tonnes/),
  })

t.create('invalid username').get('/non-existent-username.json').expectBadge({
  label: 'carbon offset',
  message: 'username not found',
  color: 'red',
})
