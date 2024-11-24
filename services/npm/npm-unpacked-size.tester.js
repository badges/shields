import { isMetricFileSize } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Latest unpacked size')
  .get('/firereact.json')
  .expectBadge({ label: 'unpacked size', message: isMetricFileSize })

t.create('Nonexistent unpacked size with version')
  .get('/express/4.16.0.json')
  .expectBadge({ label: 'unpacked size', message: 'unknown' })

t.create('Unpacked size with version')
  .get('/firereact/0.7.0.json')
  .expectBadge({ label: 'unpacked size', message: '147.2 kB' })

t.create('Unpacked size for scoped package')
  .get('/@testing-library/react.json')
  .expectBadge({ label: 'unpacked size', message: isMetricFileSize })

t.create('Unpacked size for scoped package with version')
  .get('/@testing-library/react/14.2.1.json')
  .expectBadge({ label: 'unpacked size', message: '5.4 MB' })

t.create('Nonexistent unpacked size for scoped package with version')
  .get('/@cycle/rx-run/7.2.0.json')
  .expectBadge({ label: 'unpacked size', message: 'unknown' })
