import { createServiceTester } from '../tester.js'
import { isSemver } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Version')
  .get('/ebkr/r2modman.json')
  .expectBadge({ label: 'thunderstore', message: isSemver })

t.create('Version (not found)')
  .get('/not-a-namespace/not-a-package-name.json')
  .expectBadge({ label: 'thunderstore', message: 'not found', color: 'red' })
