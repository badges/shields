import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Followers').get('/webcaetano.json').expectBadge({
  label: 'followers',
  message: isMetric,
  color: 'blue',
})

t.create('Followers (user not found)').get('/PyvesB2.json').expectBadge({
  label: 'followers',
  message: 'user not found',
})
