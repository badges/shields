import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Snapcraft Version for redis').get('/redis.json').expectBadge({
  label: 'snapcraft',
  message: isSemver,
})
