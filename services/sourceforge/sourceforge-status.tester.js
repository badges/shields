import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('status (active)')
  .get('/mingw.json')
  .expectBadge({ label: 'status', message: 'active', color: 'green' })

t.create('status (project not found)')
  .get('/that-doesnt-exist.json')
  .expectBadge({ label: 'status', message: 'project not found', color: 'red' })
