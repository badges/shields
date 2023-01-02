import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('pulsar-edit stargazers (valid)').get('/hey-pane.json').expectBadge({
  label: 'stargazers',
  message: isMetric,
  color: '#662d91',
})

t.create('pulsar-edit stargazers (not found)')
  .get('/test-package.json')
  .expectBadge({
    label: 'stargazers',
    message: 'package not found',
    color: '#662d91',
  })
