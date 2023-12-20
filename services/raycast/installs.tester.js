import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('installs (invalid user)')
  .get('/fatpandac/bilibili.json')
  .expectBadge({
    label: 'downloads',
    message: 'user/extension not found',
  })

t.create('installs (not existing extension)')
  .get('/Fatpandac/safdsaklfhe.json')
  .expectBadge({
    label: 'downloads',
    message: 'user/extension not found',
  })

t.create('installs (not existing user and extension)')
  .get('/fatpandac/safdsaklfhe.json')
  .expectBadge({
    label: 'downloads',
    message: 'user/extension not found',
  })

t.create('installs (valid)').get('/Fatpandac/bilibili.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})
