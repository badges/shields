import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Snapcraft Version for redis').get('/redis.json').expectBadge({
  label: 'snapcraft',
  message: isSemver,
})

t.create('Snapcraft Version for redis (invalid package)')
  .get('/this_package_doesnt_exist.json')
  .expectBadge({
    label: 'snapcraft',
    message: 'package not found',
  })
