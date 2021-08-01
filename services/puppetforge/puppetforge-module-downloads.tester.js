import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('module downloads').get('/camptocamp/openssl.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('module downloads (not found)')
  .get('/notarealuser/notarealpackage.json')
  .expectBadge({
    label: 'downloads',
    message: 'not found',
  })
