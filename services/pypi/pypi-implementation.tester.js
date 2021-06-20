import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('implementation (valid, package version in request)')
  .get('/beehive/1.0.json')
  .expectBadge({ label: 'implementation', message: 'cpython | jython | pypy' })

t.create('implementation (valid, no package version specified)')
  .get('/numpy.json')
  .expectBadge({ label: 'implementation', message: 'cpython' })

t.create('implementation (not specified)')
  .get('/chai/1.1.2.json')
  .expectBadge({ label: 'implementation', message: 'cpython' })

t.create('implementation (invalid)').get('/not-a-package.json').expectBadge({
  label: 'implementation',
  message: 'package or version not found',
})
