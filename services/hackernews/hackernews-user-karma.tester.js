import { createServiceTester } from '../tester.js'
import { isMetricAllowNegative } from '../test-validators.js'

export const t = await createServiceTester()

t.create('valid repo').get('/pg.json').expectBadge({
  label: 'U/pg karma',
  message: isMetricAllowNegative,
})

t.create('valid repo -- negative karma')
  .get('/negative.json')
  .intercept(nock =>
    nock('https://hacker-news.firebaseio.com/v0/user')
      .get('/negative.json')
      .reply(200, { karma: -1234 })
  )
  .expectBadge({
    label: 'U/negative karma',
    message: isMetricAllowNegative,
  })

t.create('invalid user').get('/hopefullythisdoesnotexist.json').expectBadge({
  label: 'Karma',
  message: 'user not found',
})
