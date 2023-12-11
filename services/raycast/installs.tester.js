import { createServiceTester } from '../tester.js'
import { anyInteger } from '../validators.js'
export const t = await createServiceTester()

t.create('installs (invalid user)')
  .get('/fatpandac/bilibili.json')
  .expectBadge({
    label: 'platform-support',
    message: 'user/extension not found',
  })

t.create('installs (not existing extension)')
  .get('/Fatpandac/safdsaklfhe.json')
  .expectBadge({
    label: 'platform-support',
    message: 'user/extension not found',
  })

t.create('installs (not existing user and extension)')
  .get('/fatpandac/safdsaklfhe.json')
  .expectBadge({
    label: 'platform-support',
    message: 'user/extension not found',
  })

t.create('installs (valid)').get('/Fatpandac/bilibili.json').expectBadge({
  label: 'installs',
  message: anyInteger,
})
