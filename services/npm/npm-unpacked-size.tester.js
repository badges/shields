import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Latest unpacked size')
  .get('/express.json')
  .expectBadge({ label: 'unpacked size', message: /.* kB/ })
