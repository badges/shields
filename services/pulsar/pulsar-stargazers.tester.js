import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
import { pulsarPurple } from './pulsar-helper.js'

export const t = await createServiceTester()

t.create('pulsar stargazers (valid)')
  .get('/hey-pane.json')
  .expectBadge({
    label: 'stargazers',
    message: isMetric,
    color: `#${pulsarPurple}`,
  })

t.create('pulsar stargazers (not found)')
  .get('/test-package.json')
  .expectBadge({
    label: 'stargazers',
    message: 'package not found',
  })
