import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('format (wheel, package version in request)')
  .get('/requests/2.18.4.json')
  .expectBadge({ label: 'format', message: 'wheel' })

t.create('format (wheel, no package version specified)')
  .get('/requests.json')
  .expectBadge({ label: 'format', message: 'wheel' })

t.create('format (source)')
  .get('/chai/1.1.2.json')
  .expectBadge({ label: 'format', message: 'source' })

t.create('format (egg)')
  .get('/virtualenv/0.8.2.json')
  .expectBadge({ label: 'format', message: 'egg' })

t.create('format (invalid)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'format', message: 'package or version not found' })
