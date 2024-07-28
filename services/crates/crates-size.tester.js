import { createServiceTester } from '../tester.js'
import { isFileSize } from '../test-validators.js'
export const t = await createServiceTester()

t.create('size')
  .get('/tokio.json')
  .expectBadge({ label: 'size', message: isFileSize })

t.create('size (with version)')
  .get('/tokio/1.32.0.json')
  .expectBadge({ label: 'size', message: '725 kB' })

t.create('size (with version where version doesnt have size)')
  .get('/tokio/0.1.6.json')
  .expectBadge({ label: 'size', message: 'unknown' })

t.create('size (not found)')
  .get('/not-a-crate.json')
  .expectBadge({ label: 'crates.io', message: 'not found' })
