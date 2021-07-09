import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('wheel (has wheel, package version in request)')
  .get('/requests/2.18.4.json')
  .expectBadge({ label: 'wheel', message: 'yes' })

t.create('wheel (has wheel, no package version specified)')
  .get('/requests.json')
  .expectBadge({ label: 'wheel', message: 'yes' })

t.create('wheel (no wheel)')
  .get('/chai/1.1.2.json')
  .expectBadge({ label: 'wheel', message: 'no' })

t.create('wheel (invalid)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'wheel', message: 'package or version not found' })
