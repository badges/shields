import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('valid repo -- live').get('/pg.json').expectBadge({
  label: 'pg',
  message: isMetric,
})

t.create('invalid user -- live')
  .get('/hopefullythisdoesnotexist.json')
  .expectBadge({
    label: 'HackerNews User Karma',
    message: 'user not found',
  })
