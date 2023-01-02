import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('pulsar-edit downloads (valid)').get('/hey-pane.json').expectBadge({
  label: 'downloads',
  message: isMetric,
  color: '#662d91',
})

t.create('pulsar-edit downloads (not found)')
  .get('/test-package.json')
  .expectBadge({
    label: 'downloads',
    message: 'package not found',
    color: '#662d91',
  })
