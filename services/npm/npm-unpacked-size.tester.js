import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Latest unpacked size')
  .get('/express.json')
  .expectBadge({ label: 'unpacked size', message: /.* kB/ })

t.create('Nonexistent unpacked size with version')
  .get('/express/4.16.0.json')
  .expectBadge({ label: 'unpacked size', message: 'unknown' })
