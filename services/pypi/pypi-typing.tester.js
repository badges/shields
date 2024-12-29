import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('typing (yes)')
  .get('/pyre-check.json')
  .expectBadge({ label: 'typing', message: 'typed' })

t.create('typing (no)')
  .get('/z3-solver.json')
  .expectBadge({ label: 'typing', message: 'no' })

t.create('typing (invalid)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'typing', message: 'package or version not found' })
