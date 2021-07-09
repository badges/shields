import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('status (valid, stable, package version in request)')
  .get('/django/1.11.json')
  .expectBadge({ label: 'status', message: 'stable' })

t.create('status (valid, no package version specified)')
  .get('/typing.json')
  .expectBadge({ label: 'status', message: 'stable' })

t.create('status (valid, beta)')
  .get('/django/2.0rc1.json')
  .expectBadge({ label: 'status', message: 'beta' })

t.create('status (invalid)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'status', message: 'package or version not found' })
