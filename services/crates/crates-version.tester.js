import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('version')
  .get('/libc.json')
  .expectBadge({ label: 'crates.io', message: isSemver })

t.create('version (not found)')
  .get('/not-a-real-package.json')
  .expectBadge({ label: 'crates.io', message: 'not found' })
