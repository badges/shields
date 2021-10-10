import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('xd')
  .get('/AANobbMI.json')
  .expectBadge({ label: 'downloads', message: isMetric })
