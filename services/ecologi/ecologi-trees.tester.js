import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'
export const t = await createServiceTester()

t.create('request for existing username').get('/ecologi.json').expectBadge({
  label: 'trees',
  message: isMetric,
})

t.create('request for existing username')
  .get('/ecologi.json')
  .intercept(nock =>
    nock('https://public.ecologi.com')
      .get('/users/ecologi/trees')
      .reply(200, { total: 50 })
  )
  .expectBadge({
    label: 'trees',
    message: '50',
    color: 'green',
  })

t.create('invalid username')
  .get('/non-existent-username.json')
  .expectBadge({ label: 'trees', message: 'username not found', color: 'red' })
