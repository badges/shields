import { createServiceTester } from '../tester.js'
import { withRegex } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Version')
  .get('/ebkr/r2modman')
  .expectBadge({
    label: 'thunderstore',
    message: withRegex(/^(?:0|[1-9]\d*)(\.(?:0|[1-9]\d*)){1,2}$/),
  })

t.create('Version (not found)')
  .get('/not-a-namespace/not-a-package-name')
  .expectBadge({ label: 'thunderstore', message: 'not found', color: 'red' })
