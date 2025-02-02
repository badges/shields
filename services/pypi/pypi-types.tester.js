import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('types (yes)')
  .get('/pyre-check.json')
  .expectBadge({ label: 'types', message: 'typed' })

t.create('types (no)')
  .get('/z3-solver.json')
  .expectBadge({ label: 'types', message: 'untyped' })

t.create('types (stubs)')
  .get('/types-requests.json')
  .expectBadge({ label: 'types', message: 'stubs' })

t.create('types (invalid)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'types', message: 'package or version not found' })
