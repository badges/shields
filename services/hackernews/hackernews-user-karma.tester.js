import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('valid repo').get('/pg.json').expectBadge({
  label: 'pg',
  message: isMetric,
})

t.create('invalid user').get('/hopefullythisdoesnotexist.json').expectBadge({
  label: 'HackerNews User Karma',
  message: 'user not found',
})
