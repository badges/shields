import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('license')
  .get('/libc.json')
  .expectBadge({ label: 'license', message: 'MIT OR Apache-2.0' })

t.create('license (with version)')
  .get('/libc/0.2.44.json')
  .expectBadge({ label: 'license', message: 'MIT OR Apache-2.0' })

t.create('license (not found)')
  .get('/not-a-real-package.json')
  .expectBadge({ label: 'license', message: 'not found' })

// https://github.com/badges/shields/issues/7073
t.create('license (null licenses in history)')
  .get('/stun.json')
  .expectBadge({ label: 'license', message: 'MIT/Apache-2.0' })

t.create('license (version with null license)')
  .get('/stun/0.0.1.json')
  .expectBadge({ label: 'license', message: 'invalid null license' })
