import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
import { pulsarPurple } from './pulsar-helper.js'

export const t = await createServiceTester()

t.create('pulsar downloads (valid)')
  .get('/hey-pane.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
    color: `#${pulsarPurple}`,
  })

t.create('pulsar downloads (not found)').get('/test-package.json').expectBadge({
  label: 'downloads',
  message: 'package not found',
})
