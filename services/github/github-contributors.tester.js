import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'
export const t = await createServiceTester()

t.create('Contributors').get('/contributors/badges/shields.json').expectBadge({
  label: 'contributors',
  message: isMetric,
})

t.create('1 contributor')
  .get('/contributors/badges/shields-tests.json')
  .expectBadge({
    label: 'contributors',
    message: '1',
  })

t.create('Contributors (repo not found)')
  .get('/contributors/badges/helmets.json')
  .expectBadge({
    label: 'contributors',
    message: 'repo not found',
  })
