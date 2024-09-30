import { createServiceTester } from '../tester.js'
import { isIecFileSize, isMetricFileSize } from '../test-validators.js'
export const t = await createServiceTester()

t.create('size')
  .get('/tokio.json')
  .expectBadge({ label: 'size', message: isIecFileSize })

t.create('size (metric bytes)')
  .get('/tokio.json?units=metric')
  .expectBadge({ label: 'size', message: isMetricFileSize })

t.create('size (with version)')
  .get('/tokio/1.32.0.json')
  .expectBadge({ label: 'size', message: '708 KiB' })

t.create('size (with version where version doesnt have size)')
  .get('/tokio/0.1.6.json')
  .expectBadge({ label: 'crates.io', message: 'unknown' })

t.create('size (not found)')
  .get('/not-a-crate.json')
  .expectBadge({ label: 'crates.io', message: 'not found' })
