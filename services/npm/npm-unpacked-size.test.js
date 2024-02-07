import { createServiceTester } from '../tester'

export const t = await createServiceTester()

t.create('Latest unpacked size')
  .get('/npm/usize/express')
  .expectBadge({ label: 'unpacked size', message: /.* kB/ })
