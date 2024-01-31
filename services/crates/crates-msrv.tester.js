import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// dummy crate i created specifically for this test case
t.create('msrv')
  .get('/shields-test-dummy-crate-msrv-3452398210.json')
  .expectBadge({ label: 'msrv', message: '1.69' })

t.create('msrv (with version)')
  .get('/shields-test-dummy-crate-msrv-3452398210/0.69.0.json')
  .expectBadge({ label: 'msrv', message: '1.69' })

t.create('msrv (not found)')
  .get('/not-a-real-package.json')
  .expectBadge({ label: 'msrv', message: 'not found' })
