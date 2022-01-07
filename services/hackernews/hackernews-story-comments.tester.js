import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('valid repo').get('/8863.json').expectBadge({
  label: 'comments',
  message: isMetric,
})

t.create('invalid user').get('/hopefullythisdoesnotexist.json').expectBadge({
  label: 'comments',
  message: 'story not found',
})
