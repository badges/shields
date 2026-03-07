import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('version')
  .get('/fresh.json')
  .expectBadge({ label: 'deno', message: isSemver })

t.create('version (not found)')
  .get('/not-a-real-module-that-exists.json')
  .expectBadge({ label: 'deno', message: 'not found' })
