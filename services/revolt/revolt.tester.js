import { createServiceTester } from '../tester.js'
import { isMetricWithPattern } from '../test-validators.js'

export const t = await createServiceTester()

t.create('get status of #revolt')
  .get('/01F7ZSBSFHQ8TA81725KQCSDDP.json')
  .expectBadge({
    label: 'chat',
    message: isMetricWithPattern(/ members/),
    color: 'brightgreen',
  })

t.create('custom api url')
  .get(
    '/01F7ZSBSFHQ8TA81725KQCSDDP.json?revolt_api_url=https://api.revolt.chat',
  )
  .expectBadge({
    label: 'chat',
    message: isMetricWithPattern(/ members/),
    color: 'brightgreen',
  })

t.create('invalid invite code')
  .get('/12345.json')
  .expectBadge({ label: 'chat', message: 'not found' })
